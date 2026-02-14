"""
Configuration settings for LN Tipping App
Loads from environment variables with fallback defaults
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from parent directory (project root)
env_path = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

class Settings:
    """Application settings"""
    
    # App settings
    APP_NAME: str = "Lightning Tipping App"
    VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # Database
    BASE_DIR: Path = Path(__file__).resolve().parent
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/tipping_app.db")
    
    # LNbits
    LNBITS_URL: str = os.getenv("LNBITS_URL", "https://legend.lnbits.com")
    LNBITS_ADMIN_KEY: str = os.getenv("LNBITS_ADMIN_KEY", "")
    LNBITS_INVOICE_KEY: str = os.getenv("LNBITS_INVOICE_KEY", "")
    
    # CORS
    ALLOWED_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000"
    ]
    
    # Rate limiting
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_PERIOD: int = 60  # seconds
    
    # Invoice settings
    INVOICE_EXPIRY: int = 3600  # 1 hour in seconds
    MIN_TIP_AMOUNT: int = 1  # minimum sats
    MAX_TIP_AMOUNT: int = 1000000  # maximum sats
    
    # Webhooks
    WEBHOOK_URL: str = os.getenv("WEBHOOK_URL", "http://localhost:8000/api/webhooks/payment")

settings = Settings()
