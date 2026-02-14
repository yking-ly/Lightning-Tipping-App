# ⚡ Lightning Network Tipping Application

A web application for instant Bitcoin Lightning Network tipping between users. Built for college blockchain projects and Summer of Bitcoin applications.

[![Next.js](https://img.shields.io/badge/Next.js-14.0-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

## 🌟 Features

### Core Functionality
- **User Management**: Secure registration and JWT-based authentication
- **Lightning Deposits**: Generate Lightning invoices with QR codes for instant deposits
- **Lightning Withdrawals**: Pay any Lightning invoice from your balance
- **Instant Tipping**: Send satoshis to other users with optional messages
- **Real-time Updates**: Balance and transaction updates via polling
- **Transaction History**: Complete history with filtering (sent/received/all)
- **Leaderboards**: Top tippers and most-tipped users
- **Public Feed**: Real-time feed of recent tips across the platform

### Technical Features
- **🔐 Security**: JWT authentication, password hashing (bcrypt), input validation
- **⚡ Lightning Integration**: LNbits API for invoice creation and payment processing
- **📱 Responsive Design**: Mobile-first UI with Tailwind CSS
- **🎨 Modern UI**: Glassmorphism, gradients, animations, and smooth transitions
- **🚀 Production-Ready**: Error handling, rate limiting, logging
- **💾 Database**: SQLAlchemy ORM with SQLite (easily upgradeable to PostgreSQL)
- **📊 API Documentation**: Auto-generated Swagger/OpenAPI docs



## 🚀 Quick Start (Windows 11)

### Prerequisites
- Python 3.9 or higher
- Node.js 18 or higher
- Git
- A code editor (VS Code recommended)

### 1. Clone the Repository
```powershell
git clone https://github.com/yourusername/lightning-tipping-app.git
cd lightning-tipping-app
```

### 2. Backend Setup

#### Create Virtual Environment
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
```

#### Install Dependencies
```powershell
cd ..
pip install -r requirements.txt
```

#### Configure Environment Variables
```powershell
copy .env.example .env
```

Edit `.env` and add your LNbits credentials:
- Go to https://legend.lnbits.com
- Create a wallet (no signup required)
- Copy your Admin Key and Invoice Key
- Paste them into `.env`

#### Generate Secret Key
```powershell
python -c "import secrets; print(secrets.token_urlsafe(32))"
```
Copy the output and set it as `SECRET_KEY` in `.env`

#### Initialize Database
```powershell
cd backend
python app.py
```
This will create the SQLite database and start the server on `http://localhost:8000`

### 3. Frontend Setup

Open a **new terminal**:

```powershell
cd lightning-tipping-app\frontend
npm install
```

#### Start Development Server
```powershell
npm run dev
```

Frontend will start on `http://localhost:3000`


## 📖 Usage Guide

### 1. Register an Account
- Navigate to http://localhost:3000/register
- Create username, email, and password
- Auto-login after registration

### 2. Deposit Funds
- Click "Deposit" in the navigation
- Enter amount in satoshis (recommended: 1000 sats for testing)
- Scan QR code with your Lightning wallet
- Payment detected automatically

**Test Wallets (with testnet):**
- Phoenix Wallet (Android/iOS)
- Wallet of Satoshi
- Blue Wallet

### 3. Send Tips
- Click "Send Tip"
- Search for a user or enter username
- Enter amount and optional message
- Confirm transaction

### 4. Withdraw Funds
- Click "Withdraw"
- Generate an invoice from your Lightning wallet
- Paste the invoice string
- Confirm withdrawal

### 5. View Leaderboard
- See top tippers and most-tipped users
- Rankings update in real-time

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

### Users
- `GET /api/users/profile` - Get user profile with stats
- `GET /api/users/search/{query}` - Search users
- `GET /api/users/leaderboard/tippers` - Top tippers
- `GET /api/users/leaderboard/receivers` - Most tipped users

### Lightning Operations
- `POST /api/lightning/invoice` - Create Lightning invoice
- `GET /api/lightning/invoice/{id}` - Get invoice details
- `GET /api/lightning/invoice/{id}/check` - Check payment status
- `POST /api/lightning/withdraw` - Pay Lightning invoice

### Transactions
- `POST /api/transactions/tip` - Send tip to user
- `GET /api/transactions/history` - Get transaction history
- `GET /api/transactions/feed` - Public transaction feed

Full API documentation available at `/api/docs` when running the backend.

## 🧪 Testing

### Get Testnet Bitcoin
1. Use https://legend.lnbits.com (demo instance has testnet)
2. Or get free testnet BTC from faucets:
   - https://testnet-faucet.mempool.co/
   - https://bitcoinfaucet.uo1.net/

### Manual Testing Flow
1. Register 2 users
2. Deposit funds to User 1
3. Send tip from User 1 to User 2
4. Check balances update
5. Verify transaction in history
6. Test withdrawal for User 2

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt
- **JWT Tokens**: Secure authentication with expiry
- **Input Validation**: Pydantic schemas prevent injection attacks
- **SQL Injection Protection**: SQLAlchemy ORM
- **XSS Protection**: React automatically escapes content
- **CORS Configuration**: Restricted origins
- **Environment Variables**: Sensitive data stored securely

## 📊 Database Schema

### Users Table
- id, username, email, hashed_password
- balance (satoshis)
- created_at, updated_at, is_active

### Transactions Table
- id, sender_id, receiver_id, amount
- message, status, created_at

### Invoices Table
- id, user_id, payment_request, payment_hash
- amount, status, expires_at, paid_at

### Withdrawals Table
- id, user_id, payment_request, amount
- fee, status, error_message, completed_at

## 🛠️ Technology Stack

**Backend:**
- FastAPI - Modern Python web framework
- SQLAlchemy - ORM for database operations
- Passlib - Password hashing
- Python-JOSE - JWT token handling
- HTTPX - Async HTTP client for LNbits

**Frontend:**
- Next.js 14 - React framework with App Router
- Tailwind CSS - Utility-first CSS
- Axios - HTTP client
- React Hot Toast - Toast notifications
- js-cookie - Cookie management

**Lightning:**
- LNbits API - Lightning wallet infrastructure

**Database:**
- SQLite (development)
- PostgreSQL (production-ready)

## 📄 License

MIT License - see LICENSE file for details
