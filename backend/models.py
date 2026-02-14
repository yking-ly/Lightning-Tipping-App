"""
Database models for LN Tipping App
Defines User, Transaction, Invoice, and Withdrawal tables
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, BigInteger, Text
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    """User model for authentication and profile management"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    balance = Column(BigInteger, default=0)  # Balance in satoshis
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    sent_transactions = relationship("Transaction", back_populates="sender", foreign_keys="Transaction.sender_id")
    received_transactions = relationship("Transaction", back_populates="receiver", foreign_keys="Transaction.receiver_id")
    invoices = relationship("Invoice", back_populates="user")
    withdrawals = relationship("Withdrawal", back_populates="user")
    
    def __repr__(self):
        return f"<User {self.username}>"

class Transaction(Base):
    """Transaction model for tracking tips between users"""
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(BigInteger, nullable=False)  # Amount in satoshis
    message = Column(Text, nullable=True)
    status = Column(String(20), default="completed")  # completed, pending, failed
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    sender = relationship("User", back_populates="sent_transactions", foreign_keys=[sender_id])
    receiver = relationship("User", back_populates="received_transactions", foreign_keys=[receiver_id])
    
    def __repr__(self):
        return f"<Transaction {self.id}: {self.amount} sats>"

class Invoice(Base):
    """Invoice model for Lightning Network payment requests"""
    __tablename__ = "invoices"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    payment_request = Column(Text, nullable=False)  # BOLT11 invoice
    payment_hash = Column(String(64), unique=True, index=True, nullable=False)
    amount = Column(BigInteger, nullable=False)  # Amount in satoshis
    memo = Column(Text, nullable=True)
    status = Column(String(20), default="pending")  # pending, paid, expired
    expires_at = Column(DateTime, nullable=False)
    paid_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="invoices")
    
    def __repr__(self):
        return f"<Invoice {self.id}: {self.amount} sats - {self.status}>"

class Withdrawal(Base):
    """Withdrawal model for Lightning Network payouts"""
    __tablename__ = "withdrawals"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    payment_request = Column(Text, nullable=False)  # BOLT11 invoice to pay
    payment_hash = Column(String(64), unique=True, index=True, nullable=True)
    amount = Column(BigInteger, nullable=False)  # Amount in satoshis
    fee = Column(BigInteger, default=0)  # Fee in satoshis
    status = Column(String(20), default="pending")  # pending, completed, failed
    error_message = Column(Text, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="withdrawals")
    
    def __repr__(self):
        return f"<Withdrawal {self.id}: {self.amount} sats - {self.status}>"
