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
    - Database: Exposed on port 3306

## Development Setup

The `db` initialization script is located in `backend/db/init.sql`. It will run automatically the first time the database container starts. If you modify it, you might need to wipe your Docker volumes to re-run it:

```bash
docker-compose down -v
docker-compose up --build -d
```
