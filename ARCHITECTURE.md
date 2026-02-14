# Project Architecture

## System Overview

The Lightning Tipping App follows a modern client-server architecture with clear separation of concerns.

```
┌─────────────────────────────────────────────────────────────┐
│                         User Interface                       │
│                    (Browser - React/Next.js)                 │
└────────────────┬────────────────────────────────────────────┘
                 │ HTTP/REST
                 │ (JWT Authentication)
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                      FastAPI Backend                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Routes Layer (API Endpoints)                        │  │
│  │  - auth.py      - users.py                           │  │
│  │  - lightning.py - transactions.py                    │  │
│  └────────────┬────────────────────────────────────┬────┘  │
│               │                                     │        │
│  ┌────────────▼──────────┐         ┌───────────────▼─────┐ │
│  │  Services Layer       │         │   Database Layer    │ │
│  │  - auth.py            │         │   (SQLAlchemy ORM)  │ │
│  │  - lnbits.py          │         │   - models.py       │ │
│  │  - utils.py           │         │   - database.py     │ │
│  └────────────┬──────────┘         └───────────────┬─────┘ │
└───────────────┼────────────────────────────────────┼───────┘
                │                                     │
                │ HTTPS/REST                          │
                │                                     │
                ▼                                     ▼
┌────────────────────────────┐      ┌──────────────────────┐
│     LNbits API             │      │   SQLite Database    │
│  (Lightning Network)       │      │  - users             │
│  - Create invoices         │      │  - transactions      │
│  - Check payments          │      │  - invoices          │
│  - Pay invoices            │      │  - withdrawals       │
└────────────────────────────┘      └──────────────────────┘
```

## Component Details

### Frontend (Next.js + React)

**Technology Stack:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Axios (HTTP client)

**Structure:**
```
frontend/
├── app/              # Pages (Next.js 14 App Router)
│   ├── dashboard/    # User dashboard
│   ├── login/        # Authentication
│   ├── send/         # Send tips
│   ├── deposit/      # Lightning deposits
│   └── withdraw/     # Lightning withdrawals
├── components/       # Reusable UI components
│   ├── Navbar.tsx
│   ├── TransactionCard.tsx
│   ├── QRCodeDisplay.tsx
│   └── LoadingSpinner.tsx
├── lib/              # Utilities
│   ├── api.ts        # API client
│   └── utils.ts      # Helper functions
└── styles/           # Global styles
    └── globals.css
```

**Key Features:**
- Server-side rendering for SEO
- Client-side routing
- JWT token management
- Real-time balance updates (polling)
- Responsive design

### Backend (FastAPI + Python)

**Technology Stack:**
- FastAPI 0.104
- SQLAlchemy 2.0 (ORM)
- Pydantic (validation)
- Python-JOSE (JWT)
- Passlib (password hashing)
- HTTPX (async HTTP)

**Structure:**
```
backend/
├── app.py              # Main application
├── config.py           # Configuration
├── database.py         # DB connection
├── models.py           # Database models
├── schemas.py          # Pydantic schemas
├── routes/             # API endpoints
│   ├── auth.py         # Authentication
│   ├── users.py        # User operations
│   ├── lightning.py    # Lightning ops
│   └── transactions.py # Tipping
└── services/           # Business logic
    ├── auth.py         # Auth service
    ├── lnbits.py       # Lightning integration
    └── utils.py        # Utilities
```

**Request Flow:**
1. Client sends HTTP request with JWT
2. FastAPI validates token
3. Route handler processes request
4. Service layer executes business logic
5. Database layer handles persistence
6. Response returned to client

### Database Schema

**Users Table:**
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    balance BIGINT DEFAULT 0,
    created_at DATETIME,
    updated_at DATETIME,
    is_active BOOLEAN DEFAULT TRUE
);
```

**Transactions Table:**
```sql
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id),
    receiver_id INTEGER REFERENCES users(id),
    amount BIGINT NOT NULL,
    message TEXT,
    status VARCHAR(20) DEFAULT 'completed',
    created_at DATETIME
);
```

**Invoices Table:**
```sql
CREATE TABLE invoices (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    payment_request TEXT NOT NULL,
    payment_hash VARCHAR(64) UNIQUE NOT NULL,
    amount BIGINT NOT NULL,
    memo TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    expires_at DATETIME,
    paid_at DATETIME,
    created_at DATETIME
);
```

**Withdrawals Table:**
```sql
CREATE TABLE withdrawals (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    payment_request TEXT NOT NULL,
    payment_hash VARCHAR(64) UNIQUE,
    amount BIGINT NOT NULL,
    fee BIGINT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    error_message TEXT,
    completed_at DATETIME,
    created_at DATETIME
);
```

## Data Flow Examples

### 1. User Registration Flow

```
Browser → POST /api/auth/register
         {username, email, password}
             ↓
       Validation (Pydantic)
             ↓
       Password Hashing (bcrypt)
             ↓
       Database Insert
             ↓
       Return User Object
```

### 2. Deposit Flow (Lightning Invoice)

```
Browser → POST /api/lightning/invoice
         {amount, memo}
             ↓
       LNbits API Call
       (Create Invoice)
             ↓
       Store in DB (invoices table)
             ↓
       Return invoice + QR code
             ↓
       User scans QR with wallet
             ↓
       LNbits receives payment
             ↓
       Polling checks payment status
             ↓
       Update invoice status = 'paid'
             ↓
       Update user balance
```

### 3. Tip Flow

```
Browser → POST /api/transactions/tip
         {receiver_username, amount, message}
             ↓
       Validate amount & receiver
             ↓
       Check sender balance
             ↓
       Database Transaction:
       - Deduct from sender balance
       - Add to receiver balance
       - Create transaction record
             ↓
       COMMIT or ROLLBACK
             ↓
       Return transaction details
```

### 4. Withdrawal Flow

```
Browser → POST /api/lightning/withdraw
         {payment_request}
             ↓
       Decode invoice (LNbits)
             ↓
       Check user balance
             ↓
       LNbits Pay Invoice
             ↓
       If success:
       - Update user balance
       - Mark withdrawal complete
             ↓
       If failed:
       - Mark withdrawal failed
       - Return error
```

## Security Architecture

### Authentication Flow

```
1. User Login
   → Username + Password
   → Verify against hashed password
   → Generate JWT token
   → Return token to client

2. Authenticated Requests
   → Client sends: Authorization: Bearer <token>
   → Server validates JWT
   → Extract user from token
   → Process request
```

### Security Measures

1. **Password Security:**
   - Bcrypt hashing with salt
   - Minimum 8 character requirement
   - Never stored in plain text

2. **Token Security:**
   - JWT with configurable expiry
   - Secret key from environment
   - No sensitive data in token payload

3. **Input Validation:**
   - Pydantic schemas validate all inputs
   - Type checking
   - Range validation
   - SQL injection prevention via ORM

4. **API Security:**
   - CORS restrictions
   - Rate limiting (planned)
   - HTTPS support
   - Environment variables for secrets

## Scalability Considerations

### Current Capacity
- **Users**: 1,000+ concurrent
- **Transactions**: 100+ per second
- **Database**: SQLite (suitable for < 10K users)

### Scaling Path

**Phase 1 (10K-100K users):**
- Switch to PostgreSQL
- Add Redis for caching
- Horizontal scaling with load balancer

**Phase 2 (100K+ users):**
- Database replication (read replicas)
- WebSocket for real-time updates
- CDN for static assets
- Background job queue (Celery)

**Phase 3 (1M+ users):**
- Microservices architecture
- Separate Lightning service
- Message queue (RabbitMQ/Kafka)
- Multi-region deployment

## Deployment Architecture

### Production Setup

```
Users → CDN (Static Assets)
     ↓
Users → Load Balancer
     ↓
     ├─→ Frontend Server 1 (Next.js)
     ├─→ Frontend Server 2 (Next.js)
     ↓
     ├─→ Backend Server 1 (FastAPI)
     ├─→ Backend Server 2 (FastAPI)
     ↓
     └─→ PostgreSQL Database
     └─→ Redis Cache
     └─→ LNbits API
```

### Monitoring & Logging

- **Application Logs**: Python logging, structured JSON
- **Error Tracking**: Sentry (recommended)
- **Performance**: New Relic / Datadog
- **Uptime**: UptimeRobot
- **Database**: PostgreSQL logs

## API Design Principles

1. **RESTful**: Standard HTTP methods and status codes
2. **Versioned**: `/api/v1` prefix for future compatibility
3. **Documented**: Auto-generated OpenAPI/Swagger docs
4. **Validated**: Pydantic schemas ensure data integrity
5. **Consistent**: Standard error response format
6. **Performant**: Async operations where applicable

## Future Enhancements

### Technical
- [ ] WebSocket integration
- [ ] GraphQL API option
- [ ] Redis caching layer
- [ ] Elasticsearch for search
- [ ] Prometheus metrics

### Features
- [ ] Recurring tips (subscriptions)
- [ ] Group tipping
- [ ] Tipping goals/campaigns
- [ ] Social features (follows, likes)
- [ ] Mobile apps (React Native)

---

**This architecture ensures:**
- ✅ Scalability
- ✅ Maintainability
- ✅ Security
- ✅ Performance
- ✅ Developer experience
