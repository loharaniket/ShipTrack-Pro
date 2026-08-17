# ShipTrack-Pro

A shipment tracking and logistics management application built with Spring Boot and React.

## Overview

ShipTrack-Pro is a full-stack application for managing shipment-related operations. The project focuses on building a simple logistics workflow where users can manage shipment data, track delivery progress, and organize logistics information through a web interface.

This project was created to explore the development of a production-style application using a Java backend and a modern React frontend.

## Features

Current features and development areas:

- Spring Boot backend structure
- React frontend structure
- Database integration setup
- REST API based architecture
- Shipment management foundation
- Authentication and user management (planned)
- Tracking and analytics features (planned)

## Tech Stack

### Backend

- Java
- Spring Boot
- Spring Security
- PostgreSQL
- Maven

### Frontend

- React
- React Router
- Axios

### Development Tools

- Git
- Docker
- Postman

## Installation

### Prerequisites

Make sure you have installed:

- Java 17+
- Maven
- Node.js and npm
- PostgreSQL

### Clone the repository

```bash
git clone https://github.com/loharaniket/ShipTrack-Pro.git

cd ShipTrack-Pro
```

## Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies and run the application:

```bash
mvn spring-boot:run
```

The backend service will start using the configured Spring Boot settings.

## Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

## Configuration

Backend configuration can be managed through Spring Boot configuration files.

Common settings include:

- Database connection details
- Server port configuration
- Security configuration
- Application environment settings

Example environment variables:

```env
DB_URL=your_database_url
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password
```

Do not commit sensitive credentials to the repository.

## Project Structure

```
ShipTrack-Pro/
│
├── backend/        # Spring Boot backend application
├── frontend/       # React frontend application
├── .gitignore
└── README.md
```

## Development

To work on the project locally:

1. Clone the repository.
2. Configure the backend database settings.
3. Start the Spring Boot backend.
4. Start the React frontend.
5. Create changes in a separate branch before opening a pull request.

For backend development:

```bash
cd backend
mvn test
```

For frontend development:

```bash
cd frontend
npm run dev
```

## Contributing

Contributions are welcome.

Before making major changes:

1. Create a new branch.
2. Keep changes focused and easy to review.
3. Add documentation when introducing new functionality.
4. Test changes before submitting a pull request.

## Roadmap

Planned improvements:

- User authentication
- Role-based access control
- Shipment lifecycle management
- Real-time shipment tracking
- Notification system
- Analytics dashboard

## License

This project currently does not have a license file.

If you plan to make this project open source, add an appropriate license such as MIT before accepting external contributions.

---

Maintained by Aniket Lohar