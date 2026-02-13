# Event Scheduler API

A production-grade event scheduling REST API built with NestJS, demonstrating advanced architectural patterns and industry-standard practices.

## Tech Stack

- **Framework:** NestJS (TypeScript)
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Authentication:** JWT with refresh tokens (Passport.js)
- **Documentation:** Swagger/OpenAPI
- **Validation:** class-validator + class-transformer

## Advanced NestJS Patterns

- **Custom Decorators** — `@CurrentUser()`, `@Public()`
- **Guards** — Global JWT auth guard, refresh token guard
- **Interceptors** — Response transformation for consistent API format
- **Exception Filters** — Global error handling with uniform error responses
- **Pipes** — Global validation, `ParseUUIDPipe` for param validation
- **Middleware** — HTTP request logging with response timing
- **Event-Driven Architecture** — Decoupled notifications via EventEmitter
- **Global Modules** — Prisma and Config available app-wide

## API Modules

| Module | Endpoints | Description |
|---|---|---|
| **Auth** | `POST /register`, `POST /login`, `POST /refresh` | JWT authentication with refresh token rotation |
| **Users** | `GET /me`, `PATCH /me` | Profile management with timezone support |
| **Events** | Full CRUD | Event management with visibility controls (public/private) |
| **Invitations** | `POST /`, `GET /me`, `PATCH /:id/rsvp` | Invite users to events, RSVP tracking |
| **Availability** | `POST /`, `GET /me`, `GET /check/:userId`, `DELETE /:id` | Weekly availability slots with conflict detection |
| **Health** | `GET /` | Database connectivity and uptime monitoring |

## Project Structure

```
src/
├── auth/                 # Authentication (JWT + refresh tokens)
│   ├── dto/
│   └── strategy/         # Passport JWT strategies
├── availability/         # Availability slots & conflict checking
│   └── dto/
├── common/               # Shared utilities
│   ├── decorators/       # @CurrentUser, @Public
│   ├── filters/          # Global exception filter
│   ├── guards/           # JWT auth guard, refresh guard
│   ├── interceptors/     # Response transformation
│   └── middleware/        # HTTP logger
├── config/               # Environment validation
├── events/               # Event CRUD with access control
│   └── dto/
├── health/               # Health check endpoint
├── invitations/          # Invitation & RSVP management
│   └── dto/
├── notifications/        # Event-driven notification system
│   └── events/           # Event payload classes
├── prisma/               # Database service (global)
├── users/                # User profile management
│   └── dto/
├── app.module.ts
└── main.ts
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL database (local or hosted)

### Installation

```bash
git clone <repository-url>
cd event-scheduler-api
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://user:password@host:port/database"
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
```

### Database Setup

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### Running the App

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

### API Documentation

Once the app is running, visit: `http://localhost:3000/api/docs`

## API Response Format

All responses follow a consistent format:

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-02-13T20:59:40.301Z"
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "statusCode": 400,
    "message": "Validation failed"
  },
  "timestamp": "2026-02-13T20:59:40.301Z"
}
```

## Key Design Decisions

- **Secure by default** — Global JWT guard protects all routes; public routes explicitly opt out with `@Public()`
- **API versioning** — All routes prefixed with `/api/v1` for future compatibility
- **Event-driven notifications** — Decoupled from business logic via EventEmitter pattern
- **Consistent responses** — Interceptors and filters ensure uniform API contract
- **Authorization checks** — Resource ownership validated at the service layer
- **Input validation** — DTOs with class-validator prevent malformed data at the controller layer