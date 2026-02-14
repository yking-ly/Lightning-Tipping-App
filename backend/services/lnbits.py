"""
LNbits API integration service
Handles all Lightning Network operations through LNbits REST API
"""
import httpx
import hashlib
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from config import settings

class LNbitsService:
    """Service for interacting with LNbits API"""
    
    def __init__(self):
        self.base_url = settings.LNBITS_URL
        self.admin_key = settings.LNBITS_ADMIN_KEY
        self.invoice_key = settings.LNBITS_INVOICE_KEY
        self.timeout = 30.0
    
    def _get_headers(self, admin: bool = False) -> Dict[str, str]:
        """Get request headers with appropriate API key"""
        key = self.admin_key if admin else self.invoice_key
        return {
            "X-Api-Key": key,
            "Content-Type": "application/json"
        }
    
    async def create_invoice(
        self, 
        amount: int, 
        memo: str = "Deposit to Tipping App",
        webhook: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Create a Lightning invoice
        
        Args:
            amount: Amount in satoshis
            memo: Description for the invoice
            webhook: Optional webhook URL for payment notifications
            
        Returns:
            Dictionary with payment_hash and payment_request, or None on error
        """
        try:
            url = f"{self.base_url}/api/v1/payments"
            
            payload = {
                "out": False,  # Incoming payment
                "amount": amount,
                "memo": memo,
            }
            
            if webhook:
                payload["webhook"] = webhook
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    url,
                    json=payload,
                    headers=self._get_headers(admin=False)
                )
                
                if response.status_code == 201:
                    data = response.json()
                    return {
                        "payment_hash": data.get("payment_hash"),
                        "payment_request": data.get("payment_request"),
                        "checking_id": data.get("checking_id")
                    }
                else:
                    print(f"LNbits API error creating invoice: {response.status_code} - {response.text}")
                    return None
                    
        except Exception as e:
            print(f"Error creating invoice: {str(e)}")
            return None
    
    async def check_invoice_status(self, payment_hash: str) -> Optional[Dict[str, Any]]:
        """
        Check the status of a Lightning invoice
        
        Args:
            payment_hash: Payment hash of the invoice
            
        Returns:
            Dictionary with payment status information
        """
        try:
            url = f"{self.base_url}/api/v1/payments/{payment_hash}"
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    url,
                    headers=self._get_headers(admin=False)
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    print(f"Error checking invoice: {response.status_code}")
                    return None
                    
        except Exception as e:
            print(f"Error checking invoice status: {str(e)}")
            return None
    
    async def pay_invoice(self, payment_request: str) -> Optional[Dict[str, Any]]:
        """
        Pay a Lightning invoice
        
        Args:
            payment_request: BOLT11 payment request string
            
        Returns:
            Dictionary with payment result information
        """
        try:
            url = f"{self.base_url}/api/v1/payments"
            
            payload = {
                "out": True,  # Outgoing payment
                "bolt11": payment_request
            }
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    url,
                    json=payload,
                    headers=self._get_headers(admin=True)
                )
                
                if response.status_code == 201:
                    data = response.json()
                    return {
                        "payment_hash": data.get("payment_hash"),
                        "checking_id": data.get("checking_id"),
                        "fee": data.get("fee", 0)
                    }
                else:
                    error_msg = response.text
                    print(f"LNbits API error paying invoice: {response.status_code} - {error_msg}")
                    return {"error": error_msg}
                    
        except Exception as e:
            print(f"Error paying invoice: {str(e)}")
            return {"error": str(e)}
    
    async def decode_invoice(self, payment_request: str) -> Optional[Dict[str, Any]]:
        """
        Decode a Lightning invoice to get details
        
        Args:
            payment_request: BOLT11 payment request string
            
        Returns:
            Dictionary with invoice details (amount, description, etc.)
        """
        try:
            url = f"{self.base_url}/api/v1/payments/decode"
            
            payload = {"data": payment_request}
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    url,
                    json=payload,
                    headers=self._get_headers(admin=False)
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    print(f"Error decoding invoice: {response.status_code}")
                    return None
                    
        except Exception as e:
            print(f"Error decoding invoice: {str(e)}")
            return None
    
    async def get_wallet_balance(self) -> Optional[int]:
        """
        Get the current wallet balance
        
        Returns:
            Balance in satoshis, or None on error
        """
        try:
            url = f"{self.base_url}/api/v1/wallet"
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    url,
                    headers=self._get_headers(admin=True)
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data.get("balance", 0)
                else:
                    print(f"Error getting balance: {response.status_code}")
                    return None
                    
        except Exception as e:
            print(f"Error getting wallet balance: {str(e)}")
            return None

# Create singleton instance
lnbits_service = LNbitsService()
