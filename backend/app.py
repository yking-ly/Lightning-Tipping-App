"""
Main FastAPI application
Lightning Network Tipping App - Backend
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time
import uvicorn

from config import settings
from database import init_db
from routes import auth, users, lightning, transactions

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Lightning Network powered tipping platform",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Add response time header to all requests"""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(lightning.router)
app.include_router(transactions.router)

# Root endpoint
@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "app": settings.APP_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs": "/api/docs"
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "timestamp": time.time()
    }

# Webhook endpoint for LNbits payment notifications
@app.post("/api/webhooks/payment")
async def payment_webhook(request: Request):
    """
    Webhook endpoint for LNbits payment notifications
    Called when an invoice is paid
    """
    try:
        data = await request.json()
        # Log the webhook data
        print(f"Payment webhook received: {data}")
        
        # Here you would typically:
        # 1. Verify the webhook signature
        # 2. Extract payment_hash from data
        # 3. Update invoice status in database
        # 4. Update user balance
        
        return {"status": "received"}
    except Exception as e:
        print(f"Webhook error: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": "Webhook processing failed"}
        )

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle uncaught exceptions"""
    print(f"Global exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    print(f"Starting {settings.APP_NAME} v{settings.VERSION}")
    init_db()
    print("Database initialized")
    print(f"LNbits URL: {settings.LNBITS_URL}")
    print(f"Debug mode: {settings.DEBUG}")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    print(f"Shutting down {settings.APP_NAME}")

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
