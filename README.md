# ⚡ Lightning Network Tipping Application

A production-ready web application for instant Bitcoin Lightning Network tipping between users. Built for college blockchain projects and Summer of Bitcoin applications.

[![Next.js](https://img.shields.io/badge/Next.js-14.0-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green)](https://fastapi.tiangolo.com/)
[![Lightning Network](https://img.shields.io/badge/Lightning-Network-yellow)](https://lightning.network/)
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

## 🏗️ Architecture

```
lightning-tipping-app/
├── backend/                 # FastAPI backend
│   ├── app.py              # Main application entry point
│   ├── config.py           # Configuration and environment variables
│   ├── database.py         # Database connection and session management
│   ├── models.py           # SQLAlchemy models
│   ├── schemas.py          # Pydantic schemas for validation
│   ├── routes/             # API endpoints
│   │   ├── auth.py         # Authentication routes
│   │   ├── users.py        # User management routes
│   │   ├── lightning.py    # Lightning Network operations
│   │   └── transactions.py # Transaction/tipping routes
│   └── services/           # Business logic layer
│       ├── auth.py         # Authentication service
│       ├── lnbits.py       # LNbits API integration
│       └── utils.py        # Utility functions
├── frontend/                # Next.js frontend
│   ├── app/                # Next.js 14 app directory
│   │   ├── dashboard/      # Dashboard page
│   │   ├── login/          # Login page
│   │   ├── register/       # Registration page
│   │   ├── send/           # Send tip page
│   │   ├── deposit/        # Deposit page
│   │   ├── withdraw/       # Withdrawal page
│   │   └── leaderboard/    # Leaderboard page
│   ├── components/         # Reusable React components
│   ├── lib/                # Utilities and API client
│   └── styles/             # Global CSS and Tailwind config
├── .env.example            # Environment variables template
├── requirements.txt        # Python dependencies
└── README.md              # This file
```

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

### 4. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/api/docs

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

## 🚀 Deployment

### Railway (Free Tier)
1. Create account at https://railway.app
2. Install Railway CLI
3. Run:
```powershell
railway login
railway init
railway up
```

### Render (Free Tier)
1. Create account at https://render.com
2. Connect GitHub repository
3. Create Web Service for backend
4. Create Static Site for frontend
5. Set environment variables

### Environment Variables for Production
```env
DEBUG=False
SECRET_KEY=your-production-secret-key
DATABASE_URL=postgresql://user:pass@host:port/db
LNBITS_URL=https://legend.lnbits.com
LNBITS_ADMIN_KEY=your-admin-key
LNBITS_INVOICE_KEY=your-invoice-key
WEBHOOK_URL=https://yourdomain.com/api/webhooks/payment
```

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

## 🐛 Troubleshooting

### Backend won't start
- Check Python version: `python --version` (need 3.9+)
- Activate virtual environment: `.\venv\Scripts\activate`
- Install dependencies: `pip install -r requirements.txt`

### Frontend won't start
- Check Node version: `node --version` (need 18+)
- Delete and reinstall: `rm -rf node_modules package-lock.json && npm install`

### Database errors
- Delete database: `rm backend/tipping_app.db`
- Restart backend to recreate

### LNbits API errors
- Check API keys in `.env`
- Verify keys at https://legend.lnbits.com

### CORS errors
- Update `ALLOWED_ORIGINS` in `backend/config.py`
- Restart backend

## 📈 Performance Optimizations

- Database indexing on frequently queried fields
- Connection pooling for database
- Async operations for Lightning API calls
- React memoization for expensive renders
- Image optimization with Next.js
- Code splitting and lazy loading

## 🗺️ Roadmap

- [ ] WebSocket for real-time balance updates
- [ ] Redis caching layer
- [ ] Background job queue (Celery)
- [ ] Email notifications
- [ ] 2FA authentication
- [ ] QR code scanner (camera integration)
- [ ] Multi-currency display
- [ ] Transaction charts and analytics
- [ ] Docker deployment
- [ ] Unit and integration tests

## 📄 License

MIT License - see LICENSE file for details

## 👨‍💻 Author

Built with ⚡ by [Your Name]

For Summer of Bitcoin 2026 Application

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open pull request

## 🙏 Acknowledgments

- [LNbits](https://lnbits.com) - Lightning wallet infrastructure
- [Lightning Network](https://lightning.network/) - Layer 2 payment protocol
- [Summer of Bitcoin](https://www.summerofbitcoin.org/) - Inspiration and opportunity

## 📞 Support

- Create an issue on GitHub
- Email: your.email@example.com
- Twitter: @yourhandle

---

**⚡ Powered by the Lightning Network - The Future of Payments**
