# ⚡ Lightning Network Tipping App - Quick Start

Welcome! This guide will get you up and running in **under 15 minutes**.

## What You'll Build

A full-stack Lightning Network tipping application with:
- User authentication
- Lightning deposits & withdrawals
- Instant tipping between users
- Real-time transaction feed
- Leaderboards

## Prerequisites

- ✅ Windows 11
- ✅ 15 minutes of your time
- ✅ Internet connection

## Step 1: Install Required Software (5 minutes)

### Python 3.9+
1. Go to https://python.org/downloads
2. Download and run installer
3. ✅ **Check "Add Python to PATH"**
4. Click "Install Now"

### Node.js 18+
1. Go to https://nodejs.org
2. Download LTS version
3. Run installer (default options)

### Verify Installation
Open PowerShell and run:
```powershell
python --version
node --version
```

You should see version numbers!

## Step 2: Get the Code (1 minute)

```powershell
# Navigate to your preferred location
cd C:\Users\YourUsername\Documents

# Extract the project folder
# You should now have: lightning-tipping-app/
```

## Step 3: Setup Backend (4 minutes)

```powershell
cd lightning-tipping-app

# Create virtual environment
python -m venv venv

# Activate it
.\venv\Scripts\activate

# Install dependencies (takes ~2 min)
pip install -r requirements.txt
```

### Get LNbits Keys (2 minutes)

1. Open https://legend.lnbits.com in browser
2. Click "Add a new wallet"
3. Name it "Tipping App"
4. Copy your **Admin Key** and **Invoice Key**

### Configure Environment

```powershell
# Copy template
copy .env.example .env

# Edit with Notepad
notepad .env
```

Paste your LNbits keys:
```env
LNBITS_ADMIN_KEY=your-admin-key-here
LNBITS_INVOICE_KEY=your-invoice-key-here
```

Generate secret key:
```powershell
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Paste output as `SECRET_KEY` in `.env`

### Start Backend

```powershell
cd backend
python app.py
```

✅ You should see: "Uvicorn running on http://0.0.0.0:8000"

**Keep this terminal open!**

## Step 4: Setup Frontend (3 minutes)

**Open a NEW PowerShell window:**

```powershell
cd C:\Users\YourUsername\Documents\lightning-tipping-app\frontend

# Install dependencies (takes ~3 min)
npm install

# Start frontend
npm run dev
```

✅ You should see: "ready - started server on 0.0.0.0:3000"

## Step 5: Use the App! (2 minutes)

1. Open browser: http://localhost:3000
2. Click "Register Here"
3. Create account (username: alice, email: alice@test.com, password: password123)
4. You're in! 🎉

### Test Deposit

1. Click "Deposit"
2. Enter amount: 1000
3. Click "Generate Invoice"
4. Open your Lightning wallet app
5. Scan QR code
6. Payment detected automatically!

### Create Second User (Optional)

1. Logout
2. Register as "bob"
3. Now you can send tips between alice and bob!

## Troubleshooting

### "python not found"
Use `py` instead:
```powershell
py --version
py -m venv venv
```

### "Can't activate venv"
Run this first:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Port already in use
```powershell
# Kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID <number> /F
```

### Frontend errors
Delete and reinstall:
```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

## Next Steps

- ✅ Read README.md for full documentation
- ✅ Check API.md for API reference
- ✅ Review ARCHITECTURE.md for technical details
- ✅ Try DEMO_SCRIPT.md for presentation tips

## Need Help?

- Check WINDOWS_SETUP.md for detailed guide
- Review error messages in terminal
- Ensure both backend and frontend are running

## Project Structure

```
lightning-tipping-app/
├── backend/          # FastAPI backend
├── frontend/         # Next.js frontend
├── .env             # Your configuration
├── requirements.txt  # Python dependencies
└── README.md        # Full documentation
```

## Stopping the App

- Backend terminal: `Ctrl + C`
- Frontend terminal: `Ctrl + C`
- Deactivate venv: `deactivate`

## Restarting Later

Terminal 1 (Backend):
```powershell
cd lightning-tipping-app
.\venv\Scripts\activate
cd backend
python app.py
```

Terminal 2 (Frontend):
```powershell
cd lightning-tipping-app\frontend
npm run dev
```

---

**🎉 Congratulations! You're now running a Lightning Network app!**

Ready to dive deeper? Check out the README.md!

⚡ **Happy tipping!**
