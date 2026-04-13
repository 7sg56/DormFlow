# Concurrency Control & Recovery Mechanisms

## Hostel Management System (DormFlow) — MySQL 8.0+

> **Document Version:** 1.0  
> **Date:** April 2026  
> **Database:** hostel_mgmt (5NF, 44 tables)  
> **SQL Script:** `05_concurrency_recovery.sql`

---

## Table of Contents

1. [Overview](#1-overview)
2. [Concurrency Control Mechanisms](#2-concurrency-control-mechanisms)
   - 2.1 Optimistic Concurrency Control (Row Versioning)
   - 2.2 Pessimistic Locking (SELECT … FOR UPDATE)
   - 2.3 Distributed Locking (Redis)
   - 2.4 Deadlock Detection & Retry
   - 2.5 Transaction Isolation Level Configuration
3. [Recovery Mechanisms](#3-recovery-mechanisms)
   - 3.1 Transaction Recovery Log
   - 3.2 Savepoints for Partial Rollback
   - 3.3 Write-Ahead Logging (InnoDB Redo Log)
   - 3.4 Binary Logging & Point-in-Time Recovery
   - 3.5 Backup Management
4. [Database Changes Summary](#4-database-changes-summary)
5. [Transaction Flow Diagrams](#5-transaction-flow-diagrams)
6. [Application-Level Integration](#6-application-level-integration)
7. [Testing & Verification](#7-testing--verification)

---

## 1. Overview

The hostel management system handles concurrent operations from multiple user roles (administrators, wardens, students, technicians) across shared resources like beds, facility slots, and fee records. Without proper concurrency control, the following **anomalies** can occur:

| Anomaly | Example | Risk Level |
|---------|---------|------------|
| **Lost Update** | Two wardens assign the same bed to different students simultaneously | 🔴 Critical |
| **Dirty Read** | A student sees a fee payment as "Paid" that is later rolled back | 🟡 Medium |
| **Non-Repeatable Read** | Balance calculation reads different values within the same transaction | 🟡 Medium |
| **Phantom Read** | Two facility bookings created for the same time slot | 🔴 Critical |
| **Double Payment** | Fee payment processed twice due to retry without idempotency | 🔴 Critical |

This document describes the **three-level concurrency control strategy** and **five recovery mechanisms** implemented to prevent these anomalies.

---

## 2. Concurrency Control Mechanisms

### 2.1 Optimistic Concurrency Control (Row Versioning)

**Principle:** Assume conflicts are rare. Allow concurrent reads without locking. Detect conflicts at write time by checking a version counter.

**Implementation:** A `row_version INT NOT NULL DEFAULT 1` column was added to 8 contention-prone tables. A `BEFORE UPDATE` trigger automatically increments the version on every write.

#### Tables with Row Versioning

| Table | Contention Scenario |
|-------|-------------------|
| `bed` | Multiple wardens/admins assigning beds simultaneously |
| `allocation` | Overlapping check-in/check-out operations |
| `feepayment` | Concurrent payment processing from students |
| `facility_booking` | Students booking the same time slot |
| `complaint` | Warden + technician updating status concurrently |
| `laundry_request` | Status updates from both student and vendor |
| `mess_subscription` | Plan changes during renewal window |
| `emergency_request` | Ambulance dispatch + hospital status updates |

#### Schema Change (per table)

```sql
ALTER TABLE bed ADD COLUMN row_version INT NOT NULL DEFAULT 1;

CREATE TRIGGER trg_bed_version
    BEFORE UPDATE ON bed
    FOR EACH ROW
    SET NEW.row_version = OLD.row_version + 1;
```

#### How It Works

```
Client A: SELECT * FROM bed WHERE bed_id = 'b-001';
          → row_version = 3

Client B: SELECT * FROM bed WHERE bed_id = 'b-001';
          → row_version = 3

Client A: UPDATE bed SET occupied = TRUE
          WHERE bed_id = 'b-001' AND row_version = 3;
          → ✅ 1 row affected (trigger sets row_version = 4)

Client B: UPDATE bed SET occupied = TRUE
          WHERE bed_id = 'b-001' AND row_version = 3;
          → ❌ 0 rows affected (version is now 4)
          → Application detects conflict, returns HTTP 409
```

#### Application-Level Enforcement

The CRUD factory (`crud.factory.js`) was enhanced to:
1. Extract `row_version` from the PUT request body
2. Use `withOptimisticLock()` which calls `updateMany` with `WHERE row_version = <expected>`
3. If 0 rows affected → throw `ConcurrencyConflictError` (HTTP 409)
4. Client re-fetches the record and retries with the new version

---

### 2.2 Pessimistic Locking (SELECT … FOR UPDATE)

**Principle:** For high-risk operations where conflicts ARE expected, acquire exclusive row locks BEFORE reading, blocking other transactions until the lock is released.

#### Stored Procedure: `sp_allocate_bed`

**Purpose:** Atomically allocate a bed to a student, preventing double-booking.

| Step | Action | Lock Type |
|------|--------|-----------|
| 1 | Log transaction start → `transaction_log` | None |
| 2 | `SET TRANSACTION ISOLATION LEVEL SERIALIZABLE` | Session |
| 3 | `SELECT occupied FROM bed WHERE bed_id = ? FOR UPDATE` | Exclusive row lock |
| 4 | Validate bed is available | — |
| 5 | `SELECT COUNT(*) FROM allocation WHERE student_id = ? AND status = 'Active' FOR UPDATE` | Exclusive row lock |
| 6 | `INSERT INTO allocation (…)` | — |
| 7 | `UPDATE bed SET occupied = TRUE` | — |
| 8 | `COMMIT` (releases all locks) | — |
| 9 | Log success + compensating SQL → `transaction_log` | None |

```sql
CALL sp_allocate_bed(
    's-0001-0000-0000-000000000001',  -- student_id
    'b-005',                           -- bed_id
    'Mr. Ramesh Kumar',                -- allocated_by
    'New semester allocation',         -- reason
    'u-0001-…',                        -- user_id
    'session-abc-123',                 -- session_id
    @alloc_id, @code, @msg             -- OUT params
);
SELECT @alloc_id, @code, @msg;
```

#### Stored Procedure: `sp_process_fee_payment`

**Purpose:** Process a fee payment with double-payment prevention.

- Uses `REPEATABLE READ` isolation (consistent balance calculation)
- Locks fee record `FOR UPDATE` before checking status
- If status is already 'Paid' → rejects with "double-payment prevented"
- Calculates new balance and sets status to 'Paid' or 'Partial'

#### Stored Procedure: `sp_book_facility_slot`

**Purpose:** Book a facility slot with time-overlap detection.

- Uses `SERIALIZABLE` isolation (prevents phantom insertions)
- Locks ALL bookings in the overlap window `FOR UPDATE`
- If any overlapping booking exists → rejects with conflict count
- Otherwise inserts the new booking

---

### 2.3 Distributed Locking (Redis)

**Pre-existing:** The system already uses Redis-based distributed locks for bed allocation at the application level (`allocation.routes.js`).

```javascript
const unlock = await acquireLock(`bed:${bed_id}`, 15000);
// ... critical section ...
await unlock();
```

**How it works:**
- `SET lockKey lockValue PX ttlMs NX` — atomic set-if-not-exists
- Lock value includes random token — only the owner can release
- Lua script for atomic check-and-delete on unlock
- 15-second TTL prevents permanent lock on crash

This provides coarse-grained locking at the API layer, complementing the fine-grained SQL-level locks.

---

### 2.4 Deadlock Detection & Retry

**MySQL Behavior:** InnoDB automatically detects deadlocks (circular lock waits) and rolls back the "cheapest" transaction (error 1213). The application must catch this and retry.

#### SQL-Level Retry (Stored Procedure)

```sql
CREATE PROCEDURE sp_update_complaint_with_retry(…)
BEGIN
    DECLARE v_attempts INT DEFAULT 0;
    retry_loop: WHILE v_attempts < 3 AND NOT v_done DO
        BEGIN
            DECLARE EXIT HANDLER FOR 1213  -- ER_LOCK_DEADLOCK
            BEGIN
                SET v_deadlock = TRUE;
                ROLLBACK;
            END;
            START TRANSACTION;
            UPDATE complaint SET … WHERE …;
            COMMIT;
            SET v_done = TRUE;
        END;
        -- Exponential backoff: 0.1s, 0.2s, 0.4s
        IF v_deadlock THEN DO SLEEP(POW(2, v_attempts - 1) * 0.1); END IF;
    END WHILE;
END
```

#### Application-Level Retry (`withRetry`)

```javascript
const result = await withRetry(
    async (tx) => {
        // ... Prisma transaction logic ...
    },
    { maxRetries: 3, baseDelayMs: 100 }
);
// Catches Prisma error P2034 (deadlock) and retries with exponential backoff
```

---

### 2.5 Transaction Isolation Level Configuration

| Operation | Isolation Level | Prevents |
|-----------|----------------|----------|
| Bed allocation | `SERIALIZABLE` | Phantom reads (two users seeing same bed as free) |
| Fee payment | `REPEATABLE READ` | Non-repeatable reads (balance changing mid-txn) |
| Facility booking | `SERIALIZABLE` | Phantom inserts (concurrent slot bookings) |
| Read-only dashboards | `READ COMMITTED` | Unnecessary locking on reporting queries |
| Audit log inserts | `READ UNCOMMITTED` | N/A — maximizes throughput for append-only data |

Verification procedure:
```sql
CALL sp_show_isolation_config();
```

---

## 3. Recovery Mechanisms

### 3.1 Transaction Recovery Log

**New Table:** `transaction_log`

| Column | Type | Purpose |
|--------|------|---------|
| `txn_id` | CHAR(36) PK | Unique transaction identifier |
| `txn_type` | VARCHAR(50) | Business operation: ALLOCATION, PAYMENT, BOOKING, etc. |
| `status` | ENUM | STARTED → COMMITTED / ROLLED_BACK / FAILED |
| `started_at` | DATETIME(6) | Microsecond-precision start time |
| `completed_at` | DATETIME(6) | Microsecond-precision completion time |
| `affected_tables` | JSON | Array of table names involved |
| `affected_ids` | JSON | Map of primary key → value |
| `rollback_sql` | TEXT | **Compensating SQL** to undo this transaction |
| `error_message` | TEXT | Error details on failure |
| `user_id` | CHAR(36) FK | Who initiated the transaction |
| `session_id` | VARCHAR(100) | Request/session ID for correlation |

**Recovery Workflow:**
1. Before a critical transaction begins, a `STARTED` entry is written
2. On success, the entry is updated to `COMMITTED` with compensating SQL
3. On failure, the entry is updated to `FAILED` with the error message
4. For manual recovery: DBA queries `transaction_log` for `FAILED`/`STARTED` entries and executes the `rollback_sql`

**Example compensating SQL (auto-generated):**
```sql
DELETE FROM allocation WHERE allocation_id = 'al-011';
UPDATE bed SET occupied = FALSE WHERE bed_id = 'b-005';
```

---

### 3.2 Savepoints for Partial Rollback

**Purpose:** In batch operations, rollback individual failures without losing the entire batch.

#### SQL-Level: `sp_bulk_allocate_with_savepoints`

```
START TRANSACTION;
  SAVEPOINT alloc_0;
    allocate student A → bed 1    ✅ SUCCESS
  RELEASE SAVEPOINT alloc_0;

  SAVEPOINT alloc_1;
    allocate student B → bed 2    ❌ FAIL (bed occupied)
  ROLLBACK TO SAVEPOINT alloc_1;    ← only undoes student B

  SAVEPOINT alloc_2;
    allocate student C → bed 3    ✅ SUCCESS
  RELEASE SAVEPOINT alloc_2;
COMMIT;    ← student A and C are committed, student B is skipped
```

#### Application-Level: `withSavepoint()`

```javascript
await prisma.$transaction(async (tx) => {
    await stepOne(tx);  // always runs
    
    const result = await withSavepoint(tx, 'step_two', async () => {
        return await stepTwo(tx);  // may fail
    });
    // result.success tells us if step_two succeeded
    // either way, step_one is preserved
    
    await stepThree(tx);  // always runs
});
```

---

### 3.3 Write-Ahead Logging (InnoDB Redo Log)

MySQL InnoDB uses a **Write-Ahead Log (WAL)** strategy:

1. All modifications are first written to the **redo log** (WAL) on disk
2. Only then are the actual data pages modified in the **buffer pool** (memory)
3. Background threads asynchronously flush dirty pages from buffer pool to disk
4. On crash: InnoDB replays the redo log to recover committed transactions

#### Critical Configuration Settings

| Setting | Recommended | Purpose |
|---------|-------------|---------|
| `innodb_flush_log_at_trx_commit` | `1` | Flush redo log on every commit (ACID durability) |
| `sync_binlog` | `1` | Sync binary log on every commit |
| `innodb_doublewrite` | `ON` | Detect partial page writes from OS crashes |
| `innodb_log_file_size` | `256 MB` | Larger redo log reduces checkpoint frequency |
| `innodb_buffer_pool_size` | `1 GB+` | Cache more hot data pages in memory |
| `binlog_format` | `ROW` | Row-based replication (safest for consistency) |

#### Verification

```sql
CALL sp_verify_recovery_config();
```

This procedure checks each setting and reports status with ✅/⚠️/❌ indicators.

---

### 3.4 Binary Logging & Point-in-Time Recovery

**Binary logs** record every data-modifying statement in the order it was committed. This enables:

1. **Point-in-Time Recovery (PITR):** Restore a backup, then replay binary logs up to the moment just before a failure
2. **Replication:** Stream binary logs to replica servers for high availability
3. **Audit:** Binary logs serve as an immutable record of all changes

**Recovery procedure:**
```bash
# 1. Restore the last full backup
mysql < backup_2024_01_15.sql

# 2. Replay binary logs from backup time to recovery target
mysqlbinlog --start-position=<backup_binlog_pos> \
            --stop-datetime="2024-01-16 03:00:00" \
            binlog.000042 | mysql
```

---

### 3.5 Backup Management

**New Table:** `backup_log`

Tracks every backup operation for disaster recovery auditing.

| Column | Type | Purpose |
|--------|------|---------|
| `backup_id` | CHAR(36) PK | Unique backup identifier |
| `backup_type` | ENUM | FULL / INCREMENTAL / BINLOG |
| `started_at` | DATETIME | When the backup began |
| `completed_at` | DATETIME | When the backup finished |
| `binlog_file` | VARCHAR(100) | Binary log file at backup start |
| `binlog_pos` | BIGINT | Binary log position at backup start |
| `status` | ENUM | IN_PROGRESS / COMPLETED / FAILED |
| `size_mb` | DECIMAL(10,2) | Backup file size |
| `storage_path` | VARCHAR(500) | Where the backup was stored |

**Stored Procedures:**
- `sp_create_backup_checkpoint(type, notes)` — Records a checkpoint entry before starting a backup
- `sp_complete_backup(backup_id, status, size_mb, path)` — Updates the entry after backup completes

---

## 4. Database Changes Summary

### New Tables (2)

| Table | Purpose | Columns |
|-------|---------|---------|
| `transaction_log` | Write-ahead recovery log for multi-table transactions | 11 |
| `backup_log` | Backup operation tracking for disaster recovery | 9 |

### Modified Tables (8) — Added `row_version` Column

| Table | Column Added | Trigger Created |
|-------|-------------|----------------|
| `bed` | `row_version INT NOT NULL DEFAULT 1` | `trg_bed_version` |
| `allocation` | `row_version INT NOT NULL DEFAULT 1` | `trg_allocation_version` |
| `feepayment` | `row_version INT NOT NULL DEFAULT 1` | `trg_feepayment_version` |
| `facility_booking` | `row_version INT NOT NULL DEFAULT 1` | `trg_facility_booking_version` |
| `complaint` | `row_version INT NOT NULL DEFAULT 1` | `trg_complaint_version` |
| `laundry_request` | `row_version INT NOT NULL DEFAULT 1` | `trg_laundry_request_version` |
| `mess_subscription` | `row_version INT NOT NULL DEFAULT 1` | `trg_mess_subscription_version` |
| `emergency_request` | `row_version INT NOT NULL DEFAULT 1` | `trg_emergency_request_version` |

### New Stored Procedures (8)

| Procedure | Category | Purpose |
|-----------|----------|---------|
| `sp_allocate_bed` | Pessimistic Locking | Atomic bed allocation with SERIALIZABLE isolation |
| `sp_process_fee_payment` | Pessimistic Locking | Double-payment prevention with REPEATABLE READ |
| `sp_book_facility_slot` | Pessimistic Locking | Slot conflict detection with SERIALIZABLE |
| `sp_update_complaint_with_retry` | Deadlock Retry | Automatic deadlock retry with backoff |
| `sp_show_isolation_config` | Configuration | Display isolation level recommendations |
| `sp_bulk_allocate_with_savepoints` | Savepoints | Batch allocation with per-item rollback |
| `sp_verify_recovery_config` | Recovery | Check WAL/binlog settings for safety |
| `sp_create_backup_checkpoint` | Backup | Record backup checkpoint with binlog position |
| `sp_complete_backup` | Backup | Update backup status after completion |

### New Triggers (8)

All follow the pattern `trg_<table>_version — BEFORE UPDATE` for auto-incrementing `row_version`.

### New Indexes (6)

| Index | Table | Columns |
|-------|-------|---------|
| `idx_txnlog_type_status` | `transaction_log` | `(txn_type, status)` |
| `idx_txnlog_started` | `transaction_log` | `(started_at)` |
| `idx_txnlog_user` | `transaction_log` | `(user_id)` |
| `idx_txnlog_session` | `transaction_log` | `(session_id)` |
| `idx_backup_type_status` | `backup_log` | `(backup_type, status)` |
| `idx_backup_started` | `backup_log` | `(started_at)` |

---

## 5. Transaction Flow Diagrams

### Bed Allocation — Pessimistic Locking Flow

```
┌─────────┐          ┌───────────────────────┐          ┌─────────┐
│ Client A │          │   sp_allocate_bed()   │          │ Client B │
└────┬─────┘          └───────────┬───────────┘          └────┬─────┘
     │                            │                           │
     │  CALL sp_allocate_bed()    │                           │
     ├───────────────────────────►│                           │
     │                            │ INSERT transaction_log    │
     │                            │ (status = STARTED)        │
     │                            │                           │
     │                            │ SET SERIALIZABLE          │
     │                            │ START TRANSACTION         │
     │                            │                           │
     │                            │ SELECT … FOR UPDATE       │
     │                            │ (acquires X-lock on bed)  │
     │                            │                           │
     │                            │                     CALL sp_allocate_bed()
     │                            │                           ├──────────►│
     │                            │                           │ BLOCKED   │
     │                            │                           │ (waiting  │
     │                            │ INSERT allocation         │  for lock)│
     │                            │ UPDATE bed occupied=TRUE  │           │
     │                            │ COMMIT (releases lock)    │           │
     │                            │                           │           │
     │  ◄──── result_code=0 ──────┤                           │           │
     │  (allocation successful)   │                     Lock acquired     │
     │                            │                           │           │
     │                            │                     bed.occupied=TRUE │
     │                            │                     ROLLBACK          │
     │                            │                           │           │
     │                            │                     ◄── result_code=2 │
     │                            │                     (bed occupied)    │
```

### Optimistic Concurrency Control Flow

```
┌──────────┐                    ┌──────────────────┐                    ┌──────────┐
│ Client A  │                    │     Database     │                    │ Client B  │
└─────┬─────┘                    └────────┬─────────┘                    └─────┬─────┘
      │                                   │                                    │
      │ GET /complaints/cp-001            │                                    │
      ├──────────────────────────────────►│                                    │
      │ ◄─ { status: "Open",             │                                    │
      │      row_version: 1 }            │  GET /complaints/cp-001            │
      │                                   │◄───────────────────────────────────┤
      │                                   │─── { status: "Open",              │
      │                                   │      row_version: 1 } ──────────►│
      │                                   │                                    │
      │ PUT /complaints/cp-001            │                                    │
      │ { status: "In Progress",          │                                    │
      │   row_version: 1 }               │                                    │
      ├──────────────────────────────────►│                                    │
      │                                   │ UPDATE … WHERE row_version = 1     │
      │                                   │ → 1 row affected ✅                │
      │                                   │ (trigger: row_version → 2)         │
      │ ◄─ 200 OK { row_version: 2 }     │                                    │
      │                                   │                                    │
      │                                   │    PUT /complaints/cp-001          │
      │                                   │    { status: "Resolved",           │
      │                                   │      row_version: 1 }             │
      │                                   │◄───────────────────────────────────┤
      │                                   │ UPDATE … WHERE row_version = 1     │
      │                                   │ → 0 rows affected ❌               │
      │                                   │ (version is now 2)                 │
      │                                   │── 409 Conflict ──────────────────►│
      │                                   │    "Re-fetch and retry"            │
```

---

## 6. Application-Level Integration

### Modified Files

| File | Change |
|------|--------|
| `src/lib/prisma.js` | Added Prisma middleware for OCC warnings on versioned tables |
| `src/lib/transaction.js` | **New.** Transaction utilities: `withRetry`, `withSavepoint`, `logTransaction`, `withOptimisticLock` |
| `src/routes/crud.factory.js` | PUT handler now uses `withOptimisticLock` for versioned tables + `withRetry` for all updates |

### API Changes

**PUT requests on versioned tables** now accept an optional `row_version` field:

```json
PUT /api/complaints/cp-001
{
    "status": "In Progress",
    "technician_id": "t-001",
    "row_version": 3
}
```

- If `row_version` is provided and matches → update succeeds
- If `row_version` is provided but stale → **HTTP 409** with retry hint
- If `row_version` is omitted → update proceeds without version check (backward compatible)

---

## 7. Testing & Verification

### Verify Row Versioning

```sql
-- Check initial version
SELECT bed_id, occupied, row_version FROM bed WHERE bed_id = 'b-001';
-- → row_version = 1

-- Update the record
UPDATE bed SET condition_status = 'Fair' WHERE bed_id = 'b-001';

-- Check version incremented
SELECT bed_id, occupied, row_version FROM bed WHERE bed_id = 'b-001';
-- → row_version = 2
```

### Verify Pessimistic Locking

```sql
-- Allocate a vacant bed
CALL sp_allocate_bed(
    's-0001-0000-0000-000000000001', 'b-005',
    'Test Warden', 'Unit test', NULL, 'test-session',
    @aid, @code, @msg
);
SELECT @code AS result_code, @msg AS result_msg, @aid AS allocation_id;
-- → result_code = 0, result_msg = 'Allocation successful'

-- Try to allocate the same bed again
CALL sp_allocate_bed(
    's-0001-0000-0000-000000000002', 'b-005',
    'Test Warden', 'Should fail', NULL, 'test-session',
    @aid2, @code2, @msg2
);
SELECT @code2, @msg2;
-- → result_code = 2, result_msg = 'Bed is already occupied'
```

### Verify Transaction Log

```sql
SELECT txn_id, txn_type, status, affected_ids, rollback_sql
  FROM transaction_log
 ORDER BY started_at DESC
 LIMIT 5;
```

### Verify Recovery Config

```sql
CALL sp_verify_recovery_config();
-- Reports ✅/⚠️/❌ for each InnoDB/binlog setting
```
