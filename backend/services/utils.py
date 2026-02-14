"""
Utility functions for the application
Includes helpers for formatting, validation, and common operations
"""
import re
from typing import Optional
from datetime import datetime, timedelta

def format_satoshis(sats: int) -> str:
    """Format satoshis with thousand separators"""
    return f"{sats:,} sats"

def satoshis_to_btc(sats: int) -> float:
    """Convert satoshis to BTC"""
    return sats / 100_000_000

def btc_to_satoshis(btc: float) -> int:
    """Convert BTC to satoshis"""
    return int(btc * 100_000_000)

def validate_username(username: str) -> bool:
    """
    Validate username format
    - 3-50 characters
    - Alphanumeric, underscore, hyphen only
    - Must start with letter or number
    """
    pattern = r'^[a-zA-Z0-9][a-zA-Z0-9_-]{2,49}$'
    return bool(re.match(pattern, username))

def validate_lightning_invoice(invoice: str) -> bool:
    """
    Basic validation for Lightning invoice format
    Checks if it starts with ln prefix
    """
    invoice = invoice.strip().lower()
    return invoice.startswith(('lnbc', 'lntb', 'lnbcrt'))

def get_invoice_expiry(hours: int = 1) -> datetime:
    """Get expiry datetime for invoice"""
    return datetime.utcnow() + timedelta(hours=hours)

def is_expired(expiry_time: datetime) -> bool:
    """Check if a datetime has expired"""
    return datetime.utcnow() > expiry_time

def sanitize_message(message: Optional[str]) -> Optional[str]:
    """
    Sanitize user message input
    Remove potentially harmful characters
    """
    if not message:
        return None
    
    # Remove control characters except newlines and tabs
    message = ''.join(char for char in message if char.isprintable() or char in '\n\t')
    
    # Limit length
    return message[:500] if len(message) > 500 else message

def calculate_fee(amount: int, fee_rate: float = 0.01) -> int:
    """
    Calculate withdrawal fee
    Default 1% fee rate
    """
    return max(1, int(amount * fee_rate))  # Minimum 1 sat fee

def format_timestamp(dt: datetime) -> str:
    """Format datetime for display"""
    return dt.strftime("%Y-%m-%d %H:%M:%S UTC")

def time_ago(dt: datetime) -> str:
    """
    Convert datetime to human-readable 'time ago' format
    e.g., '2 hours ago', '3 days ago'
    """
    now = datetime.utcnow()
    diff = now - dt
    
    seconds = diff.total_seconds()
    
    if seconds < 60:
        return "just now"
    elif seconds < 3600:
        minutes = int(seconds / 60)
        return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
    elif seconds < 86400:
        hours = int(seconds / 3600)
        return f"{hours} hour{'s' if hours != 1 else ''} ago"
    else:
        days = int(seconds / 86400)
        return f"{days} day{'s' if days != 1 else ''} ago"

def get_qr_code_url(data: str) -> str:
    """
    Generate QR code URL using free QR code API
    """
    from urllib.parse import quote
    encoded_data = quote(data)
    return f"https://api.qrserver.com/v1/create-qr-code/?size=300x300&data={encoded_data}"
