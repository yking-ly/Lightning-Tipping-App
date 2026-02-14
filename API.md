# API Documentation

Complete reference for Lightning Tipping App REST API.

**Base URL**: `http://localhost:8000`

**Authentication**: Bearer Token (JWT) in Authorization header

## Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Lightning Operations](#lightning-operations)
4. [Transactions](#transactions)
5. [Error Handling](#error-handling)

---

## Authentication

### Register User

**POST** `/api/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "username": "alice",
  "email": "alice@example.com",
  "password": "SecurePass123"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "username": "alice",
  "email": "alice@example.com",
  "balance": 0,
  "created_at": "2026-02-07T10:00:00",
  "is_active": true
}
```

**Errors:**
- `400`: Username or email already exists
- `400`: Invalid username format

---

### Login

**POST** `/api/auth/login`

Authenticate and receive JWT token.

**Request Body:** (form-data)
```
username: alice
password: SecurePass123
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Errors:**
- `401`: Incorrect username or password

---

### Get Current User

**GET** `/api/auth/me`

Get authenticated user information.

**Headers:**
```
Authorization: Bearer <your_token>
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "username": "alice",
  "email": "alice@example.com",
  "balance": 5000,
  "created_at": "2026-02-07T10:00:00",
  "is_active": true
}
```

---

## Users

### Get Profile

**GET** `/api/users/profile`

Get detailed profile with statistics.

**Response:** `200 OK`
```json
{
  "id": 1,
  "username": "alice",
  "email": "alice@example.com",
  "balance": 5000,
  "created_at": "2026-02-07T10:00:00",
  "is_active": true,
  "total_sent": 3000,
  "total_received": 8000,
  "transaction_count": 15
}
```

---

### Search Users

**GET** `/api/users/search/{query}`

Search for users by username.

**Parameters:**
- `query` (string): Search term (min 2 characters)

**Example:** `/api/users/search/bob`

**Response:** `200 OK`
```json
[
  {
    "id": 2,
    "username": "bob",
    "email": "bob@example.com",
    "balance": 2000,
    "created_at": "2026-02-07T11:00:00",
    "is_active": true
  }
]
```

---

### Get Leaderboards

**GET** `/api/users/leaderboard/tippers`

Get top 10 users by total sent.

**Response:** `200 OK`
```json
[
  {
    "username": "alice",
    "total_amount": 50000,
    "transaction_count": 25
  },
  {
    "username": "bob",
    "total_amount": 30000,
    "transaction_count": 15
  }
]
```

**GET** `/api/users/leaderboard/receivers`

Get top 10 users by total received.

---

## Lightning Operations

### Create Invoice

**POST** `/api/lightning/invoice`

Generate a Lightning invoice for deposit.

**Request Body:**
```json
{
  "amount": 1000,
  "memo": "Deposit for tipping"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "payment_request": "lnbc10u1p3jx2...",
  "payment_hash": "3a5f7e2b1c...",
  "amount": 1000,
  "memo": "Deposit for tipping",
  "status": "pending",
  "expires_at": "2026-02-07T15:00:00",
  "created_at": "2026-02-07T14:00:00"
}
```

---

### Check Invoice Payment

**GET** `/api/lightning/invoice/{invoice_id}/check`

Check if invoice has been paid.

**Response:** `200 OK`
```json
{
  "paid": true,
  "amount": 1000
}
```

or

```json
{
  "paid": false,
  "expired": false
}
```

---

### Create Withdrawal

**POST** `/api/lightning/withdraw`

Pay a Lightning invoice (withdraw funds).

**Request Body:**
```json
{
  "payment_request": "lnbc10u1p3jx2..."
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "amount": 1000,
  "fee": 1,
  "status": "completed",
  "created_at": "2026-02-07T14:00:00",
  "completed_at": "2026-02-07T14:00:05"
}
```

**Errors:**
- `400`: Invalid Lightning invoice
- `400`: Insufficient balance
- `500`: Payment failed

---

## Transactions

### Send Tip

**POST** `/api/transactions/tip`

Send satoshis to another user.

**Request Body:**
```json
{
  "receiver_username": "bob",
  "amount": 100,
  "message": "Great work! ⚡"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "sender_id": 1,
  "sender_username": "alice",
  "receiver_id": 2,
  "receiver_username": "bob",
  "amount": 100,
  "message": "Great work! ⚡",
  "status": "completed",
  "created_at": "2026-02-07T14:00:00"
}
```

**Errors:**
- `400`: Insufficient balance
- `400`: Cannot tip yourself
- `404`: Receiver not found

---

### Get Transaction History

**GET** `/api/transactions/history`

Get user's transaction history.

**Query Parameters:**
- `filter_type` (optional): 'sent', 'received', or omit for all

**Example:** `/api/transactions/history?filter_type=sent`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "sender_id": 1,
    "sender_username": "alice",
    "receiver_id": 2,
    "receiver_username": "bob",
    "amount": 100,
    "message": "Great work! ⚡",
    "status": "completed",
    "created_at": "2026-02-07T14:00:00"
  }
]
```

---

### Get Public Feed

**GET** `/api/transactions/feed`

Get recent public transactions.

**Query Parameters:**
- `limit` (optional): Number of transactions (default: 20, max: 100)

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "sender_id": 1,
    "sender_username": "alice",
    "receiver_id": 2,
    "receiver_username": "bob",
    "amount": 100,
    "message": "Great work! ⚡",
    "status": "completed",
    "created_at": "2026-02-07T14:00:00"
  }
]
```

---

## Error Handling

All errors follow this format:

```json
{
  "detail": "Error message here"
}
```

### HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (invalid/missing token)
- `404`: Not Found
- `500`: Internal Server Error

### Common Error Responses

**401 Unauthorized:**
```json
{
  "detail": "Could not validate credentials"
}
```

**400 Bad Request:**
```json
{
  "detail": "Insufficient balance"
}
```

---

## Rate Limiting

- 100 requests per minute per IP
- Exceeding limit returns `429 Too Many Requests`

## WebSocket Support

Coming in future version for real-time balance updates.

---

## Interactive Documentation

Visit `http://localhost:8000/api/docs` for Swagger UI with:
- Interactive API testing
- Request/response examples
- Schema definitions
- Try-it-out functionality

---

**Need help?** Open an issue on GitHub or contact support.
