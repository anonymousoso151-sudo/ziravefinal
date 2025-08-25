# ZİRAVE Custom Backend

This is the custom NestJS backend service for the ZİRAVE agricultural platform. It handles complex business logic and integrates with Supabase and AI services.

## Features

- **Supabase Integration** - Direct integration with Supabase for database operations
- **JWT Authentication** - Token verification and refresh using Supabase Auth
- **API Documentation** - Swagger/OpenAPI documentation
- **Modular Architecture** - Clean separation of concerns with modules
- **Content Moderation** - Basic chat content filtering
- **Statistics & Analytics** - Platform usage statistics

## Tech Stack

- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth + JWT
- **Documentation:** Swagger/OpenAPI
- **Validation:** class-validator

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run start:dev
```

The server will start on `http://localhost:3000`

API Documentation will be available at `http://localhost:3000/api/docs`

## Project Structure

```
backend-custom/
├── src/
│   ├── auth/          # Authentication module
│   ├── users/         # User management
│   ├── products/      # Product operations
│   ├── chat/          # Chat and messaging
│   ├── supabase/      # Supabase service
│   ├── app.module.ts  # Main application module
│   └── main.ts        # Application entry point
├── .env.example       # Environment variables template
└── README.md
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `JWT_SECRET` - Secret for JWT token signing
- `PORT` - Server port (default: 3000)

## API Endpoints

### Health
- `GET /` - Health check
- `GET /status` - Detailed system status

### Authentication
- `POST /auth/verify-token` - Verify Supabase JWT token
- `POST /auth/refresh` - Refresh authentication token

### Users
- `GET /users/profile/:id` - Get user profile
- `GET /users/stats` - Get user statistics

### Products
- `GET /products` - Get products (with optional category filter)
- `GET /products/stats` - Get product statistics

### Chat
- `GET /chat/conversations/:userId` - Get user conversations
- `POST /chat/moderate` - Moderate message content
- `GET /chat/stats` - Get chat statistics

## Development

This backend service is designed to work alongside Supabase, handling:
- Complex business logic that can't be done in Edge Functions
- AI service integration
- Advanced analytics and reporting
- Content moderation
- Custom authentication flows

The service uses Supabase as the primary database and authentication provider, with this NestJS backend handling the more complex operations.