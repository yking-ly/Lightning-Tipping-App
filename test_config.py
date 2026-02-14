"""
Quick test to check if .env is loading correctly
"""
import sys
sys.path.insert(0, 'C:/Zapster/lightning-tipping-app/backend')

from config import settings

print("=" * 50)
print("ENVIRONMENT VARIABLES TEST")
print("=" * 50)
print(f"DEBUG: {settings.DEBUG}")
print(f"DATABASE_URL: {settings.DATABASE_URL}")
print(f"LNBITS_URL: {settings.LNBITS_URL}")
print(f"SECRET_KEY: {settings.SECRET_KEY[:20]}...")
print("=" * 50)

# Test database URL processing
test_url = settings.DATABASE_URL.replace("sqlite://", "sqlite:///")
print(f"Processed URL: {test_url}")
print("=" * 50)
