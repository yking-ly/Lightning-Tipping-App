# Windows 11 Setup Guide

Complete step-by-step guide for setting up the Lightning Tipping App on Windows 11.

## Prerequisites Installation

### 1. Install Python 3.9+

1. Download Python from https://www.python.org/downloads/
2. Run installer
3. **Important**: Check "Add Python to PATH"
4. Click "Install Now"
5. Verify installation:
```powershell
python --version
# Should show Python 3.9 or higher
```

### 2. Install Node.js 18+

1. Download from https://nodejs.org/
2. Run installer and follow prompts
3. Verify installation:
```powershell
node --version
npm --version
```

### 3. Install Git

1. Download from https://git-scm.com/download/win
2. Run installer with default options
3. Verify:
```powershell
git --version
```

## Project Setup

### Step 1: Get the Code

```powershell
# Navigate to where you want the project
cd C:\Users\YourUsername\Documents

# Clone or download the project
# If you have it as a ZIP, extract it
# If on GitHub:
git clone https://github.com/yourusername/lightning-tipping-app.git

cd lightning-tipping-app
```

### Step 2: Backend Setup

```powershell
# Navigate to project root
cd lightning-tipping-app

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\activate

# You should see (venv) in your terminal now

# Install backend dependencies
pip install -r requirements.txt

# This might take 2-3 minutes
```

### Step 3: Configure Environment

```powershell
# Copy the example environment file
copy .env.example .env

# Now edit .env with Notepad
notepad .env
```

#### Get LNbits Credentials

1. Open your browser and go to https://legend.lnbits.com
2. Click "Add a new wallet"
3. Give it a name (e.g., "Tipping App")
4. Click on the wallet you just created
5. Click on "API Info" or find the keys section
6. Copy the **Admin Key** and **Invoice/Read Key**
7. Paste them in your `.env` file

#### Generate Secret Key

```powershell
# Generate a secure secret key
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Copy the output and paste it as SECRET_KEY in .env
```

Your `.env` should look like:
```env
DEBUG=True
SECRET_KEY=the-random-key-you-just-generated
LNBITS_URL=https://legend.lnbits.com
LNBITS_ADMIN_KEY=your-admin-key-from-lnbits
LNBITS_INVOICE_KEY=your-invoice-key-from-lnbits
```

### Step 4: Start Backend

```powershell
# Make sure you're in backend directory
cd backend

# Run the server
python app.py
```

You should see:
```
Starting Lightning Tipping App v1.0.0
Database initialized
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Leave this terminal open!** The backend is now running.

### Step 5: Frontend Setup (New Terminal)

Open a **NEW PowerShell window** (don't close the backend one):

```powershell
# Navigate to frontend directory
cd C:\Users\YourUsername\Documents\lightning-tipping-app\frontend

# Install dependencies (this takes 3-5 minutes)
npm install

# Start the frontend
npm run dev
```

You should see:
```
ready - started server on 0.0.0.0:3000
```

## Access the Application

Open your browser and go to:
- **Application**: http://localhost:3000
- **API Docs**: http://localhost:8000/api/docs

## First Time Usage

### 1. Create an Account

1. Click "Register Here" on the login page
2. Choose a username (e.g., "alice")
3. Enter your email
4. Create a password (minimum 8 characters)
5. Click "Create Account"

You'll be automatically logged in!

### 2. Deposit Some Sats (For Testing)

1. Click "Deposit" in the navigation bar
2. Enter 1000 in the amount field
3. Click "Generate Invoice"
4. Open your Lightning wallet app (see below for recommendations)
5. Scan the QR code OR copy and paste the invoice
6. Pay the invoice
7. The page will automatically detect the payment

### 3. Create a Second User (For Testing Tips)

1. Log out (top right)
2. Register another user (e.g., "bob")
3. Now you can test sending tips between accounts!

## Lightning Wallet Setup

To actually use the Lightning Network, you need a wallet. Here are easy options:

### Option 1: Wallet of Satoshi (Easiest)
- Download from iOS App Store or Google Play
- Open and activate
- Tap "Receive" to get testnet sats from faucets
- Scan QR codes from the app to pay invoices

### Option 2: Phoenix Wallet
- Download from phoenix.acinq.co
- More advanced but better for learning
- Supports both testnet and mainnet

### Option 3: Blue Wallet
- Download from bluewallet.io
- Good balance of features and simplicity

### Getting Test Bitcoin (Testnet)

To get free testnet Bitcoin for testing:

1. If using LNbits demo (legend.lnbits.com), it's already on testnet
2. Get testnet BTC from faucets:
   - https://testnet-faucet.mempool.co/
   - https://bitcoinfaucet.uo1.net/

**IMPORTANT**: Never use real Bitcoin for testing! Always use testnet.

## Common Windows-Specific Issues

### Issue: `python` command not found

**Solution**: Use `py` instead of `python`:
```powershell
py --version
py -m venv venv
py app.py
```

### Issue: Can't activate virtual environment

**Solution**: Enable script execution:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then try activating again:
```powershell
.\venv\Scripts\activate
```

### Issue: Port 8000 or 3000 already in use

**Solution**: Kill the process using the port:
```powershell
# For port 8000 (backend)
netstat -ano | findstr :8000
# Note the PID number
taskkill /PID <PID_NUMBER> /F

# For port 3000 (frontend)
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

### Issue: `npm install` fails

**Solution**: Clear cache and try again:
```powershell
npm cache clean --force
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Issue: Database locked error

**Solution**: Close all terminal windows and delete the database:
```powershell
cd backend
Remove-Item tipping_app.db
# Restart backend to recreate
python app.py
```

## Stopping the Application

To stop the servers:

1. In the backend terminal: Press `Ctrl + C`
2. In the frontend terminal: Press `Ctrl + C`
3. Deactivate virtual environment: `deactivate`

## Restarting the Application Later

### Backend:
```powershell
cd lightning-tipping-app
.\venv\Scripts\activate
cd backend
python app.py
```

### Frontend (in new terminal):
```powershell
cd lightning-tipping-app\frontend
npm run dev
```

## File Locations

- **Database**: `backend/tipping_app.db`
- **Logs**: Terminal output (not saved by default)
- **Configuration**: `.env` file in project root

## Next Steps

1. Read the main README.md for full documentation
2. Check out the API documentation at http://localhost:8000/api/docs
3. Explore the code in VS Code
4. Try deploying to Railway or Render

## Getting Help

If you encounter issues:

1. Check this guide first
2. Look in the "Troubleshooting" section of README.md
3. Check terminal output for error messages
4. Make sure both backend and frontend are running
5. Verify LNbits keys are correct in `.env`

## Video Tutorial

For a visual walkthrough, check out: [Add YouTube link here]

---

**You're all set! Happy coding with Lightning! ⚡**
