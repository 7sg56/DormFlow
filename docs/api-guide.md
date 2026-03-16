# DormFlow API Guide

> Base URL: `http://localhost:5001/api`

---

## Authentication

All mutation endpoints require a **Bearer token**. Obtain one via `/api/auth/login`.

```
Authorization: Bearer <access_token>
```

### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "admin@dormflow.edu",
  "password": "securepassword",
  "role": "admin"
}
```

**Response** `201`:

```json
{
  "success": true,
  "data": {
    "user": { "user_id": "...", "email": "...", "role": "admin" },
    "access_token": "eyJ...",
    "refresh_token": "eyJ..."
  }
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@dormflow.edu",
  "password": "securepassword"
}
```

### Refresh Token

```http
POST /api/auth/refresh
Content-Type: application/json

{ "refresh_token": "eyJ..." }
```

### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Logout

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

---

## Standard CRUD Pattern

Every entity below follows this pattern unless noted otherwise.

### List (paginated, cached)

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
GET /api/{entity}/{uuid}
```

### Create

```http
POST /api/{entity}
Content-Type: application/json
Idempotency-Key: <optional-uuid>

{ ...fields }
```

**Response** `201`:

```json
{ "success": true, "data": { ...created_record } }
```

### Update

```http
PUT /api/{entity}/{uuid}
Content-Type: application/json

{ ...fields_to_update }
```

### Delete

```http
DELETE /api/{entity}/{uuid}
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
| `GET` | `/api/health` | Health check (DB + Redis status) |

### Hostels

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/hostels` | List hostels |
| `GET` | `/api/hostels/:id` | Get hostel |
| `POST` | `/api/hostels` | Create hostel |
| `PUT` | `/api/hostels/:id` | Update hostel |
| `DELETE` | `/api/hostels/:id` | Delete hostel |

**Create/Update body**:

```json
{
  "hostel_name": "Sunrise Boys Hostel",
  "type": "Boys",
  "total_floors": 5,
  "address": "12 College Road",
  "city": "Chennai",
  "state": "Tamil Nadu",
  "pincode": "600001",
  "established_year": 2005,
  "registration_no": "REG-BH-001",
  "warden_name": "Mr. Ramesh Kumar",
  "warden_phone": "9841000001",
  "warden_email": "ramesh@hostel.edu",
  "office_phone": "04400001",
  "emergency_phone": "04400911"
}
```

### Students

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/students` | List students (includes active allocation) |
| `GET` | `/api/students/:id` | Get student with guardians + allocation |
| `POST` | `/api/students` | Create student |
| `PUT` | `/api/students/:id` | Update student |
| `DELETE` | `/api/students/:id` | Delete student |

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
  "status": "Active"
}
```

### Rooms

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/rooms` | List rooms (includes hostel + beds) |
| `GET` | `/api/rooms/:id` | Get room |
| `POST` | `/api/rooms` | Create room |
| `PUT` | `/api/rooms/:id` | Update room |
| `DELETE` | `/api/rooms/:id` | Delete room |

**Create body**:

```json
{
  "room_number": "101",
  "floor": 1,
  "capacity": 2,
  "room_type": "Double",
  "hostel_id": "<hostel-uuid>",
  "monthly_rent": 4500.00,
  "area_sqft": 220.0,
  "facing": "East",
  "room_condition": "Good"
}
```

### Beds

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/beds` | List beds (includes room + hostel) |
| `GET` | `/api/beds/:id` | Get bed |
| `POST` | `/api/beds` | Create bed |
| `PUT` | `/api/beds/:id` | Update bed |
| `DELETE` | `/api/beds/:id` | Delete bed |

### Allocations (Redis-locked)

> Uses a **Redis distributed lock** on the bed to prevent double-booking under concurrent requests. Rate-limited to **5 requests per 10 seconds**.

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
  "student_id": "<student-uuid>",
  "bed_id": "<bed-uuid>",
  "start_date": "2024-07-01",
  "allocated_by": "Mr. Ramesh Kumar",
  "status": "Active"
}
```

**Concurrency behavior**:

- If the bed is being processed by another request: `429` with retry message
- If the bed is already occupied: `409`
- If the student already has an active allocation: `409`

### Fee Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/fees` | List payments |
| `GET` | `/api/fees/:id` | Get payment |
| `POST` | `/api/fees` | Create payment |
| `PUT` | `/api/fees/:id` | Update payment |
| `DELETE` | `/api/fees/:id` | Delete payment |

### Complaints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/complaints` | List (includes student, room, technician) |
| `GET` | `/api/complaints/:id` | Get complaint |
| `POST` | `/api/complaints` | Create complaint |
| `PUT` | `/api/complaints/:id` | Update (assign tech, resolve) |
| `DELETE` | `/api/complaints/:id` | Delete complaint |

### Mess & Menu

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET/POST/PUT/DELETE` | `/api/messes/*` | Mess CRUD |
| `GET/POST/PUT/DELETE` | `/api/menus/*` | Menu CRUD |
| `GET/POST/PUT/DELETE` | `/api/mess-subscriptions/*` | Subscription CRUD |

### Facilities

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET/POST/PUT/DELETE` | `/api/facilities/*` | Facility CRUD |
| `GET/POST/PUT/DELETE` | `/api/facility-bookings/*` | Booking CRUD |

### Logs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET/POST/PUT/DELETE` | `/api/access-logs/*` | Access log CRUD |
| `GET/POST/PUT/DELETE` | `/api/visitor-logs/*` | Visitor log CRUD |

### Laundry

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET/POST/PUT/DELETE` | `/api/laundries/*` | Laundry service CRUD |
| `GET/POST/PUT/DELETE` | `/api/laundry-requests/*` | Laundry request CRUD |

### Store & Pharmacy

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET/POST/PUT/DELETE` | `/api/stores/*` | Store CRUD |
| `GET/POST/PUT/DELETE` | `/api/store-purchases/*` | Purchase CRUD |
| `GET/POST/PUT/DELETE` | `/api/pharmacies/*` | Pharmacy CRUD |
| `GET/POST/PUT/DELETE` | `/api/pharmacy-visits/*` | Visit CRUD |

### Gym & Emergency

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET/POST/PUT/DELETE` | `/api/gyms/*` | Gym CRUD |
| `GET/POST/PUT/DELETE` | `/api/gym-memberships/*` | Membership CRUD |
| `GET/POST/PUT/DELETE` | `/api/ambulances/*` | Ambulance CRUD |
| `GET/POST/PUT/DELETE` | `/api/emergency-requests/*` | Emergency request CRUD |

### Other

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET/POST/PUT/DELETE` | `/api/notices/*` | Notice board CRUD |
| `GET/POST/PUT/DELETE` | `/api/maintenance/*` | Maintenance schedule CRUD |
| `GET/POST/PUT/DELETE` | `/api/guardians/*` | Student guardian CRUD |
| `GET/POST/PUT/DELETE` | `/api/technicians/*` | Technician CRUD |
| `GET/POST/PUT/DELETE` | `/api/restaurants/*` | Restaurant CRUD |

---

## Error Responses

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "Description of error",
  "details": [ ... ]
}
```

| Status | Meaning |
|--------|---------|
| `400` | Validation error (Zod) or bad request |
| `401` | Missing/invalid/expired token |
| `403` | Insufficient permissions (role) |
| `404` | Record not found |
| `409` | Conflict (duplicate record, bed occupied) |
| `429` | Rate limit exceeded |
| `500` | Internal server error |

### Validation Error Example

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    { "field": "hostel_name", "message": "Required", "location": "body" },
    { "field": "total_floors", "message": "Expected number, received string", "location": "body" }
  ]
}
```

---

## Security Headers

### HMAC Signature (production)

For mutation endpoints (POST/PUT/DELETE), clients must sign requests:

```
X-HMAC-Signature: HMAC-SHA256(timestamp + method + path + body)
X-HMAC-Timestamp: 1710612345000
```

> Auto-disabled in development when using the default HMAC secret.

### Idempotency

Prevent duplicate creates by sending:

```
Idempotency-Key: <unique-uuid>
```

- Same key + same body = returns cached response
- Same key + different body = `409` conflict
- Keys expire after 24 hours

---

## Rate Limits

| Tier | Window | Max Requests | Applied To |
|------|--------|-------------|------------|
| Global | 1 min | 200 | All `/api/*` routes |
| Write | 1 min | 30 | POST/PUT/DELETE |
| Booking | 10 sec | 5 | Allocations, facility bookings |
| Auth | 15 min | 10 | Login, register |

---

## Caching

All GET endpoints are cached in Redis (default 5 min TTL). Cache is automatically invalidated on any POST/PUT/DELETE to the same entity.

Check logs for `[CACHE HIT]` / `[CACHE SET]` messages.

---

## Pagination

All list endpoints accept:

| Param | Type | Default | Range |
|-------|------|---------|-------|
| `page` | int | 1 | >= 1 |
| `limit` | int | 20 | 1-100 |
| `sort` | string | `created_at` | any column |
| `order` | string | `desc` | `asc` / `desc` |

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
| `REDIS_HOST` | No | `redis` | Redis host |
| `REDIS_PORT` | No | `6379` | Redis port |
| `JWT_SECRET` | Yes | - | JWT signing secret |
| `HMAC_SECRET` | Yes | - | HMAC signing secret |
| `SENTRY_DSN` | No | - | Sentry project DSN |
| `NODE_ENV` | No | `development` | Environment |
| `DATABASE_URL` | Yes | - | Prisma connection string |

---

## Quick Start

```bash
# Start all services
docker compose up --build -d

# Health check
curl http://localhost:5001/api/health

# List hostels
curl http://localhost:5001/api/hostels

# Create a student
curl -X POST http://localhost:5001/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "reg_no": "REG2024099",
    "first_name": "Test",
    "last_name": "Student",
    "date_of_birth": "2004-01-01",
    "gender": "Male"
  }'
```
