# Project Management System (PMS) API

A NestJS-based REST API with PostgreSQL, Prisma ORM, JWT authentication, and soft delete functionality.

## Features

- **Authentication**: JWT-based authentication with Passport.js
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Request validation using class-validator
- **Soft Delete**: Laravel-style soft delete with epoch timestamps
- **TypeScript**: Full TypeScript support

## Tech Stack

- NestJS
- Prisma ORM
- PostgreSQL
- JWT (JSON Web Tokens)
- Passport.js
- bcryptjs
- class-validator
- class-transformer

## Database Schema

### User Table
- `id` - String (CUID)
- `email` - String (unique)
- `username` - String (unique)
- `password` - String (hashed)
- `role` - Enum (super_admin, perhutani, admin, user)
- `is_active` - Boolean
- `created_at` - Integer (epoch timestamp)
- `updated_at` - Integer (epoch timestamp)  
- `deleted_at` - Integer (epoch timestamp, nullable for soft delete)

## API Endpoints

### Authentication

#### Register User
```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "role": "USER" // Optional, defaults to USER
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "username": "username",
  "password": "password123"
}

Response:
{
  "access_token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "username",
    "email": "user@example.com",
    "role": "USER"
  }
}
```

#### Get Profile (Protected)
```
GET /auth/profile
Authorization: Bearer {jwt_token}
```

#### Update Profile (Protected)
```
PATCH /auth/profile
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "email": "newemail@example.com",
  "username": "newusername"
}
```

#### Deactivate Account (Protected)
```
DELETE /auth/profile
Authorization: Bearer {jwt_token}
```

## Installation & Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   
   Update `.env` file with your database connection:
   ```
   DATABASE_URL="postgresql://username:password@host:port/database_name"
   JWT_SECRET="your-super-secret-jwt-key"
   JWT_EXPIRES_IN="24h"
   PORT=3000
   NODE_ENV="development"
   ```

3. **Database Setup**
   ```bash
   # Push schema to database (for hosted databases without migration permissions)
   npx prisma db push
   
   # OR use migrations (if you have database creation permissions)
   npx prisma migrate dev --name initial
   
   # Generate Prisma client
   npx prisma generate
   ```

4. **Run the application**
   ```bash
   # Development
   npm run start:dev
   
   # Production build
   npm run build
   npm run start:prod
   ```

## Development Commands

```bash
# Build the project
npm run build

# Start development server with hot reload
npm run start:dev

# Run tests
npm run test

# Run e2e tests
npm run test:e2e

# Lint code
npm run lint

# Format code
npm run format
```

## Database Operations

```bash
# View database in Prisma Studio
npx prisma studio

# Reset database (development only)
npx prisma db push --force-reset

# Generate Prisma client after schema changes
npx prisma generate
```

## Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── dto/             # Data Transfer Objects
│   ├── guards/          # Auth guards (JWT, Local)
│   ├── strategies/      # Passport strategies
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── prisma/              # Database service
│   ├── prisma.service.ts
│   └── prisma.module.ts
├── app.module.ts        # Main application module
└── main.ts             # Application entry point

prisma/
├── schema.prisma       # Database schema
└── migrations/         # Database migrations

generated/
└── prisma/            # Generated Prisma client
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | Secret key for JWT tokens | Required |
| `JWT_EXPIRES_IN` | JWT token expiration time | "24h" |
| `PORT` | Application port | 3000 |
| `NODE_ENV` | Environment mode | "development" |

## Testing

The project includes e2e tests for authentication endpoints. Run tests with:

```bash
npm run test:e2e
```

## Soft Delete Implementation

The project uses Laravel-style soft delete with epoch timestamps:
- Uses `deleted_at` field with integer type
- Stores epoch timestamp when soft deleted
- NULL value means record is not deleted
- Includes helper methods in PrismaService for soft delete operations

## Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Request validation with class-validator
- Protected routes with JWT guards
- User role-based access (ADMIN, USER)

## API Testing Examples

You can test the API using curl or any HTTP client:

```bash
# Register a new user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"password123"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# Get profile (replace TOKEN with actual JWT token)
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer TOKEN"
```

## License

This project is licensed under the UNLICENSED license.
