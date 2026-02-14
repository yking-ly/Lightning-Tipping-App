"""
Pydantic schemas for request/response validation
Ensures data integrity and automatic API documentation
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, validator

# ============ User Schemas ============

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: int
    balance: int
    created_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True

class UserProfile(UserResponse):
    total_sent: int = 0
    total_received: int = 0
    transaction_count: int = 0

# ============ Token Schemas ============

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    username: Optional[str] = None

# ============ Transaction Schemas ============

class TransactionCreate(BaseModel):
    receiver_username: str
    amount: int = Field(..., gt=0)
    message: Optional[str] = Field(None, max_length=500)

class TransactionResponse(BaseModel):
    id: int
    sender_id: int
    sender_username: str
    receiver_id: int
    receiver_username: str
    amount: int
    message: Optional[str]
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# ============ Invoice Schemas ============

class InvoiceCreate(BaseModel):
    amount: int = Field(..., gt=0, description="Amount in satoshis")
    memo: Optional[str] = Field(None, max_length=200)

class InvoiceResponse(BaseModel):
    id: int
    payment_request: str
    payment_hash: str
    amount: int
    memo: Optional[str]
    status: str
    expires_at: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True

# ============ Withdrawal Schemas ============

class WithdrawalCreate(BaseModel):
    payment_request: str = Field(..., description="BOLT11 Lightning invoice")
    
    @validator('payment_request')
    def validate_invoice(cls, v):
        """Basic validation for Lightning invoice format"""
        v = v.strip()
        if not v.lower().startswith(('lnbc', 'lntb', 'lnbcrt')):
            raise ValueError('Invalid Lightning invoice format')
        return v

class WithdrawalResponse(BaseModel):
    id: int
    amount: int
    fee: int
    status: str
    error_message: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]
    
    class Config:
        from_attributes = True

# ============ Stats Schemas ============

class LeaderboardEntry(BaseModel):
    username: str
    total_amount: int
    transaction_count: int

class DashboardStats(BaseModel):
    balance: int
    total_sent: int
    total_received: int
    pending_invoices: int
    recent_transactions: List[TransactionResponse]

# ============ Generic Response ============

class MessageResponse(BaseModel):
    message: str
    success: bool = True
