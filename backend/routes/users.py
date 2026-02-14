"""
User routes
Handles user profile, search, and leaderboard operations
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List
from database import get_db
from models import User, Transaction
from schemas import UserResponse, UserProfile, LeaderboardEntry
from routes.auth import get_current_user

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get("/profile", response_model=UserProfile)
async def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Get current user's profile with statistics
    Includes balance, total sent, total received, and transaction count
    """
    # Calculate statistics
    total_sent = db.query(func.sum(Transaction.amount)).filter(
        Transaction.sender_id == current_user.id,
        Transaction.status == "completed"
    ).scalar() or 0
    
    total_received = db.query(func.sum(Transaction.amount)).filter(
        Transaction.receiver_id == current_user.id,
        Transaction.status == "completed"
    ).scalar() or 0
    
    transaction_count = db.query(func.count(Transaction.id)).filter(
        (Transaction.sender_id == current_user.id) | 
        (Transaction.receiver_id == current_user.id)
    ).scalar() or 0
    
    profile_data = {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "balance": current_user.balance,
        "created_at": current_user.created_at,
        "is_active": current_user.is_active,
        "total_sent": total_sent,
        "total_received": total_received,
        "transaction_count": transaction_count
    }
    
    return profile_data

@router.get("/search/{query}", response_model=List[UserResponse])
async def search_users(
    query: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Search users by username
    Returns matching users (excluding current user)
    """
    if len(query) < 2:
        raise HTTPException(status_code=400, detail="Search query must be at least 2 characters")
    
    users = db.query(User).filter(
        User.username.ilike(f"%{query}%"),
        User.id != current_user.id,
        User.is_active == True
    ).limit(10).all()
    
    return users

@router.get("/leaderboard/tippers", response_model=List[LeaderboardEntry])
async def get_top_tippers(db: Session = Depends(get_db)):
    """
    Get leaderboard of top tippers
    Shows users who have sent the most tips
    """
    results = db.query(
        User.username,
        func.coalesce(func.sum(Transaction.amount), 0).label('total_amount'),
        func.count(Transaction.id).label('transaction_count')
    ).outerjoin(
        Transaction, Transaction.sender_id == User.id
    ).filter(
        Transaction.status == "completed"
    ).group_by(
        User.id, User.username
    ).order_by(
        desc('total_amount')
    ).limit(10).all()
    
    return [
        {
            "username": r.username,
            "total_amount": r.total_amount,
            "transaction_count": r.transaction_count
        }
        for r in results
    ]

@router.get("/leaderboard/receivers", response_model=List[LeaderboardEntry])
async def get_top_receivers(db: Session = Depends(get_db)):
    """
    Get leaderboard of most tipped users
    Shows users who have received the most tips
    """
    results = db.query(
        User.username,
        func.coalesce(func.sum(Transaction.amount), 0).label('total_amount'),
        func.count(Transaction.id).label('transaction_count')
    ).outerjoin(
        Transaction, Transaction.receiver_id == User.id
    ).filter(
        Transaction.status == "completed"
    ).group_by(
        User.id, User.username
    ).order_by(
        desc('total_amount')
    ).limit(10).all()
    
    return [
        {
            "username": r.username,
            "total_amount": r.total_amount,
            "transaction_count": r.transaction_count
        }
        for r in results
    ]

@router.get("/{username}", response_model=UserResponse)
async def get_user_by_username(
    username: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user details by username"""
    user = db.query(User).filter(User.username == username).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user
