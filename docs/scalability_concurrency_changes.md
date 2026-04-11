# Production Scale Concurrency Optimization

## Context
Initial implementation of the concurrency mechanisms in `05_concurrency_recovery.sql` utilized the `SERIALIZABLE` isolation level for critical high-contention stored procedures like `sp_allocate_bed` and `sp_book_facility_slot`. While `SERIALIZABLE` represents the gold standard for data consistency (preventing dirty reads, non-repeatable reads, and phantom reads), its behavior in MySQL/InnoDB creates significant performance bottlenecks when deployed at massive scale.

## The Scaling Problem
When DormFlow scales from a seed environment (~10 students, 3 hostels) to a full production deployment supporting **100+ hostels and hundreds of thousands of students**, the use of `SERIALIZABLE` becomes a critical vulnerability:

1. **InnoDB Gap Locking:** To prevent phantom reads, `SERIALIZABLE` forces InnoDB to place "gap locks" on index ranges. If Warden A allocates Bed B-010, the database might lock the surrounding index gaps (e.g., all beds between B-005 and B-015).
2. **Lock Contention:** If Warden B simultaneously tries to allocate Bed B-012, they will be blocked by Warden A's gap lock—even though they are allocating an entirely different resource.
3. **Deadlock Cascades:** At extreme throughput (e.g., semester start day when thousands of students are assigned beds simultaneously), this overlapping gap-lock contention inevitably leads to massive deadlock spirals, transaction timeouts, and systemic database failure.

## The Solution: `READ COMMITTED` + Explicit Row Locks

To resolve the gap-locking bottleneck without sacrificing data consistency, we implemented the following changes:

### 1. Isolation Level Downgrade
The isolation level for `sp_allocate_bed` and `sp_book_facility_slot` was explicitly lowered from `SERIALIZABLE` to `READ COMMITTED`. 
* **Purpose:** `READ COMMITTED` strictly disables gap locking in InnoDB. The database will only lock the exact rows being scanned or modified.

### 2. Explicit Narrow Locks (`SELECT ... FOR UPDATE`)
By mixing `READ COMMITTED` with `SELECT ... FOR UPDATE`, we achieve highly targeted **Pessimistic Row Locks**:
* When a student requests a bed, we lock *only that specific bed row* and *only that specific student's allocation records*.
* Simultaneous allocations for different beds or different students proceed completely unhindered.

### 3. Application-Layer Protection
Because `READ COMMITTED` theoretically opens the door to phantom insertions (e.g., someone creating a conflicting facility booking in the exact same fraction of a second), we absorb this risk at the application layer:
* **Redis Distributed Locking:** As implemented in `allocation.routes.js`, rapid-fire requests for the same exact resource are serialized by Redis in memory before they ever hit the database connection pool.
* **Optimistic Concurrency Control (OCC):** The `row_version` mechanism handles non-critical contention (like updating a complaint slip) without locking the database at all.

## Summary of Altered Behavior

| Workload Type | Old Implementation (`SERIALIZABLE`) | New Implementation (`READ COMMITTED`) | Result |
| :--- | :--- | :--- | :--- |
| **Concurrent Allocations (Different Beds)** | Transactions block each other due to index gap locks. High deadlock risk. | Transactions route parallel to each other. | **Massive throughput increase.** |
| **Concurrent Allocations (Same Bed)** | Database gap locks force serialization. | Explicit `FOR UPDATE` serializes the transaction. | **Safety maintained.** |
| **Overlapping Facility Bookings** | Entire date range locked. | Redis filters concurrent assaults; OCC handles edge cases. | **No phantom bookings, zero gap locks.** |
