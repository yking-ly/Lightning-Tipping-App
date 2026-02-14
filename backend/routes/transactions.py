"""
Transaction routes
Handles tipping between users and transaction history
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from typing import List, Optional
from database import get_db
from models import User, Transaction
from schemas import TransactionCreate, TransactionResponse, MessageResponse
from routes.auth import get_current_user
from services.utils import sanitize_message
from config import settings

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])

@router.post("/tip", response_model=TransactionResponse)
async def send_tip(
    tip_data: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Send a tip to another user
    - Validates receiver exists
    - Checks sufficient balance
    - Creates transaction
    - Updates balances atomically
    """
    # Validate amount
    if tip_data.amount < settings.MIN_TIP_AMOUNT:
        raise HTTPException(
            status_code=400,
            detail=f"Minimum tip amount is {settings.MIN_TIP_AMOUNT} sats"
        )
    
    if tip_data.amount > settings.MAX_TIP_AMOUNT:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum tip amount is {settings.MAX_TIP_AMOUNT} sats"
        )
    
    # Can't tip yourself
    if tip_data.receiver_username == current_user.username:
        raise HTTPException(status_code=400, detail="You cannot tip yourself")
    
    # Find receiver
    receiver = db.query(User).filter(User.username == tip_data.receiver_username).first()
    
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")
    
    if not receiver.is_active:
        raise HTTPException(status_code=400, detail="Receiver account is not active")
    
    # Check sender balance
    if current_user.balance < tip_data.amount:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient balance. You have {current_user.balance} sats, need {tip_data.amount} sats"
        )
    
    # Sanitize message
    message = sanitize_message(tip_data.message)
    
    # Create transaction
    new_transaction = Transaction(
        sender_id=current_user.id,
        receiver_id=receiver.id,
        amount=tip_data.amount,
        message=message,
        status="completed"
    )
    
    # Update balances
    current_user.balance -= tip_data.amount
    receiver.balance += tip_data.amount
    
    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)
    
    # Prepare response with usernames
    response_data = {
        "id": new_transaction.id,
        "sender_id": new_transaction.sender_id,
        "sender_username": current_user.username,
        "receiver_id": new_transaction.receiver_id,
        "receiver_username": receiver.username,
        "amount": new_transaction.amount,
        "message": new_transaction.message,
        "status": new_transaction.status,
        "created_at": new_transaction.created_at
    }
    
    return response_data

@router.get("/history", response_model=List[TransactionResponse])
async def get_transaction_history(
    filter_type: Optional[str] = None,  # 'sent', 'received', or None for all
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get transaction history for current user
    Optional filter: 'sent', 'received', or all transactions
    """
    query = db.query(Transaction)
    
    if filter_type == "sent":
        query = query.filter(Transaction.sender_id == current_user.id)
    elif filter_type == "received":
        query = query.filter(Transaction.receiver_id == current_user.id)
    else:
        # All transactions
        query = query.filter(
            or_(
                Transaction.sender_id == current_user.id,
                Transaction.receiver_id == current_user.id
            )
        )
    
    transactions = query.order_by(desc(Transaction.created_at)).limit(50).all()
    
    # Format response with usernames
    results = []
    for txn in transactions:
        sender = db.query(User).filter(User.id == txn.sender_id).first()
        receiver = db.query(User).filter(User.id == txn.receiver_id).first()
        
        results.append({
            "id": txn.id,
            "sender_id": txn.sender_id,
            "sender_username": sender.username if sender else "Unknown",
            "receiver_id": txn.receiver_id,
            "receiver_username": receiver.username if receiver else "Unknown",
            "amount": txn.amount,
            "message": txn.message,
            "status": txn.status,
            "created_at": txn.created_at
        })
    
    return results

@router.get("/feed", response_model=List[TransactionResponse])
async def get_public_feed(
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """
    Get public feed of recent tips
    Shows recent transactions across all users
    """
    if limit > 100:
        limit = 100
    
    transactions = db.query(Transaction).filter(
        Transaction.status == "completed"
    ).order_by(desc(Transaction.created_at)).limit(limit).all()
    
    # Format response
    results = []
    for txn in transactions:
        sender = db.query(User).filter(User.id == txn.sender_id).first()
        receiver = db.query(User).filter(User.id == txn.receiver_id).first()
        
        results.append({
            "id": txn.id,
            "sender_id": txn.sender_id,
            "sender_username": sender.username if sender else "Unknown",
            "receiver_id": txn.receiver_id,
            "receiver_username": receiver.username if receiver else "Unknown",
            "amount": txn.amount,
            "message": txn.message,
            "status": txn.status,
            "created_at": txn.created_at
        })
    
    return results

@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific transaction details"""
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        or_(
            Transaction.sender_id == current_user.id,
            Transaction.receiver_id == current_user.id
        )
    ).first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    sender = db.query(User).filter(User.id == transaction.sender_id).first()
    receiver = db.query(User).filter(User.id == transaction.receiver_id).first()
    
    return {
        "id": transaction.id,
        "sender_id": transaction.sender_id,
        "sender_username": sender.username if sender else "Unknown",
        "receiver_id": transaction.receiver_id,
        "receiver_username": receiver.username if receiver else "Unknown",
        "amount": transaction.amount,
        "message": transaction.message,
        "status": transaction.status,
        "created_at": transaction.created_at
    }
