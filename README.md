# Hostel Management System

A client-server application bootstrapped with Docker Compose.

## Architecture

- **Frontend**: Next.js
- **Backend**: Express.js (TypeScript)
- **Database**: MySQL

## Prerequisites

- Docker and Docker Compose

## Quick Start

1.  **Environment Variables**: 
    Copy the example `.env` file and modify if necessary.
    ```bash
    cp .env.example .env
    ```

2.  **Start Services**:
    Run Docker Compose to build and start the containers.
    ```bash
    docker-compose up --build -d
    ```

3.  **Access the Application**:
    - Frontend: http://localhost:3000
    - Backend API: http://localhost:5001
    - Database: Exposed on port 3307

## Development Setup

The database initialization scripts are in `backend/db/` and run automatically (in alphabetical order) the first time the database container starts:

- `01_init.sql` — Schema creation (29 tables)
- `02_data.sql` — Seed data
- `03_views.sql` — Views

If you modify any of these, wipe Docker volumes to re-run initialization:

```bash
docker-compose down -v
docker-compose up --build -d
```
