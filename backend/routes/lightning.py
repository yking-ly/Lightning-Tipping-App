"""
Lightning Network routes
Handles invoice creation, payment checking, and withdrawals via LNbits
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List
from database import get_db
from models import User, Invoice, Withdrawal
from schemas import InvoiceCreate, InvoiceResponse, WithdrawalCreate, WithdrawalResponse
from routes.auth import get_current_user
from services.lnbits import lnbits_service
from services.utils import get_invoice_expiry, get_qr_code_url
from config import settings

router = APIRouter(prefix="/api/lightning", tags=["Lightning Network"])

async def check_invoice_payment(invoice_id: int, db: Session):
    """
    Background task to check invoice payment status
    Updates invoice and user balance when paid
    """
    try:
        invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
        if not invoice or invoice.status != "pending":
            return
        
        # Check with LNbits
        result = await lnbits_service.check_invoice_status(invoice.payment_hash)
        
        if result and result.get("paid"):
            # Update invoice status
            invoice.status = "paid"
            invoice.paid_at = datetime.utcnow()
            
            # Update user balance
            user = db.query(User).filter(User.id == invoice.user_id).first()
            if user:
                user.balance += invoice.amount
            
            db.commit()
            
    except Exception as e:
        print(f"Error checking invoice payment: {str(e)}")
        db.rollback()

@router.post("/invoice", response_model=InvoiceResponse)
async def create_invoice(
    invoice_data: InvoiceCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a Lightning invoice for depositing funds
    - Generates invoice via LNbits
    - Stores in database
    - Returns payment request and QR code
    """
    # Validate amount
    if invoice_data.amount < settings.MIN_TIP_AMOUNT:
        raise HTTPException(
            status_code=400,
            detail=f"Minimum amount is {settings.MIN_TIP_AMOUNT} sats"
        )
    
    if invoice_data.amount > settings.MAX_TIP_AMOUNT:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum amount is {settings.MAX_TIP_AMOUNT} sats"
        )
    
    # Create invoice via LNbits
    memo = invoice_data.memo or f"Deposit for {current_user.username}"
    result = await lnbits_service.create_invoice(
        amount=invoice_data.amount,
        memo=memo,
        webhook=settings.WEBHOOK_URL
    )
    
    if not result:
        raise HTTPException(
            status_code=500,
            detail="Failed to create invoice. Please check LNbits configuration."
        )
    
    # Save invoice to database
    new_invoice = Invoice(
        user_id=current_user.id,
        payment_request=result["payment_request"],
        payment_hash=result["payment_hash"],
        amount=invoice_data.amount,
        memo=memo,
        status="pending",
        expires_at=get_invoice_expiry()
    )
    
    db.add(new_invoice)
    db.commit()
    db.refresh(new_invoice)
    
    # Schedule background check for payment
    background_tasks.add_task(check_invoice_payment, new_invoice.id, db)
    
    return new_invoice

@router.get("/invoice/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(
    invoice_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get invoice details by ID"""
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.user_id == current_user.id
    ).first()
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    return invoice

@router.get("/invoice/{invoice_id}/check")
async def check_invoice(
    invoice_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check if an invoice has been paid
    Updates database if payment detected
    """
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.user_id == current_user.id
    ).first()
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    if invoice.status == "paid":
        return {"paid": True, "amount": invoice.amount}
    
    # Check with LNbits
    result = await lnbits_service.check_invoice_status(invoice.payment_hash)
    
    if result and result.get("paid"):
        # Update invoice
        invoice.status = "paid"
        invoice.paid_at = datetime.utcnow()
        
        # Update user balance
        current_user.balance += invoice.amount
        
        db.commit()
        
        return {"paid": True, "amount": invoice.amount}
    
    # Check if expired
    if datetime.utcnow() > invoice.expires_at:
        invoice.status = "expired"
        db.commit()
        return {"paid": False, "expired": True}
    
    return {"paid": False, "expired": False}

@router.get("/invoices", response_model=List[InvoiceResponse])
async def get_user_invoices(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all invoices for current user"""
    invoices = db.query(Invoice).filter(
        Invoice.user_id == current_user.id
    ).order_by(Invoice.created_at.desc()).limit(20).all()
    
    return invoices

@router.post("/withdraw", response_model=WithdrawalResponse)
async def create_withdrawal(
    withdrawal_data: WithdrawalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Withdraw funds by paying a Lightning invoice
    - Decodes invoice to get amount
    - Checks user balance
    - Pays invoice via LNbits
    - Updates user balance
    """
    # Decode invoice to get amount
    decoded = await lnbits_service.decode_invoice(withdrawal_data.payment_request)
    
    if not decoded:
        raise HTTPException(status_code=400, detail="Invalid Lightning invoice")
    
    # Get amount in satoshis (LNbits returns millisatoshis)
    amount_msats = decoded.get("amount_msat", 0)
    amount = amount_msats // 1000
    
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Invoice amount must be greater than 0")
    
    # Check user balance
    if current_user.balance < amount:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient balance. You have {current_user.balance} sats, need {amount} sats"
        )
    
    # Create withdrawal record
    new_withdrawal = Withdrawal(
        user_id=current_user.id,
        payment_request=withdrawal_data.payment_request,
        amount=amount,
        status="pending"
    )
    
    db.add(new_withdrawal)
    db.commit()
    db.refresh(new_withdrawal)
    
    # Attempt to pay invoice
    result = await lnbits_service.pay_invoice(withdrawal_data.payment_request)
    
    if result and "error" not in result:
        # Payment successful
        new_withdrawal.status = "completed"
        new_withdrawal.payment_hash = result.get("payment_hash")
        new_withdrawal.fee = result.get("fee", 0)
        new_withdrawal.completed_at = datetime.utcnow()
        
        # Deduct from user balance (amount + fee)
        total_deduction = amount + new_withdrawal.fee
        current_user.balance -= total_deduction
        
        db.commit()
        db.refresh(new_withdrawal)
        
        return new_withdrawal
    else:
        # Payment failed
        new_withdrawal.status = "failed"
        new_withdrawal.error_message = result.get("error", "Unknown error") if result else "Payment failed"
        db.commit()
        db.refresh(new_withdrawal)
        
        raise HTTPException(
            status_code=500,
            detail=f"Withdrawal failed: {new_withdrawal.error_message}"
        )

@router.get("/withdrawals", response_model=List[WithdrawalResponse])
async def get_user_withdrawals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all withdrawals for current user"""
    withdrawals = db.query(Withdrawal).filter(
        Withdrawal.user_id == current_user.id
    ).order_by(Withdrawal.created_at.desc()).limit(20).all()
    
    return withdrawals

@router.get("/qr/{invoice_string}")
async def get_qr_code(invoice_string: str):
    """Generate QR code URL for a Lightning invoice"""
    qr_url = get_qr_code_url(invoice_string)
    return {"qr_url": qr_url}
