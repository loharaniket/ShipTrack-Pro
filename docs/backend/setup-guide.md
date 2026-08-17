# ShipTrack Pro - Backend Setup Guide

## Prerequisites
- **Java 21** or later
- **Apache Maven 3.9+**
- **PostgreSQL 15+** running on `localhost:5432`

---

## Database Configuration

1. Ensure PostgreSQL is active and create the database:
   ```sql
   CREATE DATABASE shiptrack;
   ```
2. Database connection parameters are specified in `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/shiptrack
   spring.datasource.username=postgres
   spring.datasource.password=aniket@12345
   ```
3. Automatic Flyway migrations are located in `src/main/resources/db/migration/` and execute on startup.

---

## Building and Running the Application

### 1. Build and Run Tests
```bash
cd backend
mvn clean test
```

### 2. Run Local Development Server
```bash
mvn spring-boot:run
```
The server will start on port `8080` (or `server.port` specified in `application.properties`).

---

## File Uploads Directory
Proof of Delivery (POD) uploaded files are stored in the project's root under `uploads/pod/` and served statically via `/uploads/**`.
