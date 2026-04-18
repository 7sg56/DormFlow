# DormFlow API Guide

> Base URL: `http://localhost:5001/api`
> Framework: Fastify 5 | Auth: Clerk | DB: MySQL 8.0 (raw mysql2)

---

## Authentication

All endpoints under `/api/*` require a valid **Clerk session**. The frontend sends session cookies automatically via `@clerk/nextjs`; API clients must include the Clerk session token as a Bearer header.

```
Authorization: Bearer <clerk_session_token>
```

### Get Current User

```http
GET /api/auth/me
```

**Response** `200`:

```json
{
  "success": true,
  "data": {
    "userId": "user_2x...",
    "sessionId": "sess_...",
    "role": "admin"
  }
}
```

> Sign-in methods: **Google SSO** and **Email**. Register, login, logout, and password reset are handled entirely by Clerk's hosted UI. No custom auth endpoints exist.

---

## Standard CRUD Pattern

Every entity below follows this pattern unless noted otherwise.

### List (paginated)

```http
GET /api/{entity}?page=1&limit=20&sort=created_at&order=desc
```

**Response**:

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 142,
    "totalPages": 8
  }
}
```

### Get by ID

```http
GET /api/{entity}/{id}
```

### Create

```http
POST /api/{entity}
Content-Type: application/json

{ ...fields }
```

**Response** `201`:

```json
{ "success": true, "data": { ...created_record } }
```

### Update

```http
PUT /api/{entity}/{id}
Content-Type: application/json

{ ...fields_to_update }
```

### Delete

```http
DELETE /api/{entity}/{id}
```

**Response**:

```json
{ "success": true, "message": "{entity} deleted" }
```

---

## Endpoints Reference

### Core

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Service info |
| `GET` | `/api/health` | Health check (DB status) |
| `GET` | `/api/auth/me` | Current user (Clerk session) |

### Hostels

| Method | Endpoint | Description |
|--------|----------|-------------|
| CRUD | `/api/hostels` | Hostel management |

**Create/Update body**:

```json
{
  "hostel_name": "Sunrise Boys Hostel",
  "type": "Boys",
  "total_floors": 5,
  "address": "12 College Road",
  "pincode": "600001",
  "established_year": 2005,
  "registration_no": "REG-BH-001",
  "office_phone": "04400001",
  "emergency_phone": "04400911"
}
```

> City/state are resolved via `pincode_locality` table (3NF).

### Students

| Method | Endpoint | Description |
|--------|----------|-------------|
| CRUD | `/api/students` | Student management |

**Create body**:

```json
{
  "reg_no": "REG2024001",
  "first_name": "Arjun",
  "last_name": "Mehta",
  "date_of_birth": "2003-04-12",
  "gender": "Male",
  "phone_primary": "9790100001",
  "email_personal": "arjun@gmail.com",
  "email_institutional": "arjun@college.edu",
  "department": "Computer Science",
  "course": "B.Tech",
  "academic_year": 3,
  "semester": 5,
  "blood_group": "O+",
  "admission_date": "2021-07-01",
  "status": "Active",
  "guardian_name": "Prakash Mehta",
  "guardian_phone": "9840200001",
  "guardian_relation": "Father",
  "mess_id": "<mess-id>"
}
```

> Guardian info and mess subscription are stored directly on the student record.

### Rooms & Beds

| Method | Endpoint | Description |
|--------|----------|-------------|
| CRUD | `/api/rooms` | Room management (includes hostel name) |
| CRUD | `/api/beds` | Bed management (includes room + hostel) |

### Allocations (MySQL-locked)

> Uses **MySQL `GET_LOCK()`** on the bed to prevent double-booking. Rate-limited to **5 requests per 10 seconds**.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/allocations` | List allocations |
| `GET` | `/api/allocations/:id` | Get allocation |
| `POST` | `/api/allocations` | Create allocation (locks bed) |
| `PUT` | `/api/allocations/:id` | Update (auto-frees bed on vacate) |
| `DELETE` | `/api/allocations/:id` | Delete (frees bed) |

**Create body**:

```json
{
  "student_id": "<student-id>",
  "bed_id": "<bed-id>",
  "start_date": "2024-07-01",
  "allocated_by": "Mr. Ramesh Kumar",
  "status": "Active"
}
```

**Concurrency behavior**:

- Bed being processed: `429` with retry message
- Bed already occupied: `409`
- Student already allocated: `409`

### Fee Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| CRUD | `/api/fees` | Fee payment management |

### Complaints

| Method | Endpoint | Description |
|--------|----------|-------------|
| CRUD | `/api/complaints` | Complaint management (student, room, technician) |

### Technicians

| Method | Endpoint | Description |
|--------|----------|-------------|
| CRUD | `/api/technicians` | Technician management |

### Messes

| Method | Endpoint | Description |
|--------|----------|-------------|
| CRUD | `/api/messes` | Mess management (menu in `menu_description` field) |

### Wardens

| Method | Endpoint | Description |
|--------|----------|-------------|
| CRUD | `/api/wardens` | Hostel warden management |

### Laundries

| Method | Endpoint | Description |
|--------|----------|-------------|
| CRUD | `/api/laundries` | Laundry service management |

### Visitor Logs

| Method | Endpoint | Description |
|--------|----------|-------------|
| CRUD | `/api/visitor-logs` | Visitor log management |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dashboard/stats` | Aggregate stats (students, beds, fees, complaints) |
| `GET` | `/api/dashboard/hostel-stats` | Per-hostel stats (`v_hostel_stats` view) |
| `GET` | `/api/dashboard/fee-summary` | Per-student fee summary (`v_fee_summary` view) |
| `GET` | `/api/dashboard/complaint-board` | Complaint board (`v_complaint_dashboard` view) |
| `GET` | `/api/dashboard/room-occupancy` | Room occupancy (`v_room_occupancy` view) |

---

## Error Responses

```json
{
  "success": false,
  "error": "Description of error"
}
```

| Status | Meaning |
|--------|---------|
| `400` | Validation error or bad request |
| `401` | Missing/invalid Clerk session |
| `403` | Insufficient permissions (role) |
| `404` | Record not found |
| `409` | Conflict (duplicate record, bed occupied, FK constraint) |
| `429` | Rate limit exceeded |
| `500` | Internal server error |

---

## Rate Limits

| Tier | Window | Max Requests | Applied To |
|------|--------|-------------|------------|
| Global | 1 min | 200 | All `/api/*` routes |
| Booking | 10 sec | 5 | Allocations |

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DB_HOST` | Yes | `db` | MySQL host |
| `DB_USER` | Yes | `root` | MySQL user |
| `DB_PASSWORD` | Yes | `hostel` | MySQL password |
| `DB_NAME` | Yes | `hostel_mgmt` | Database name |
| `DB_PORT` | No | `3306` | MySQL port |
| `PORT` | No | `5001` | API port |
| `NODE_ENV` | No | `development` | Environment |
| `LOG_LEVEL` | No | `info` | Log level (error/warn/info/debug) |
| `CLERK_SECRET_KEY` | Yes | - | Clerk secret key |
| `CLERK_PUBLISHABLE_KEY` | Yes | - | Clerk publishable key |
| `FRONTEND_URL` | No | `http://localhost:3000` | CORS origin |

---

## Quick Start

```bash
# Start all services
docker compose up --build -d

# Health check
curl http://localhost:5001/api/health

# List hostels (requires Clerk session)
curl http://localhost:5001/api/hostels \
  -H "Authorization: Bearer <clerk_token>"
```
