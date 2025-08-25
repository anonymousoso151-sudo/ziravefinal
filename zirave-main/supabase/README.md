# ZİRAVE Supabase Configuration

This directory contains the Supabase configuration, database migrations, and Edge Functions for the ZİRAVE agricultural platform.

## Structure

```
supabase/
├── config.toml          # Supabase local development configuration
├── migrations/          # Database schema migrations
├── functions/           # Supabase Edge Functions
├── seed.sql            # Initial data for development
└── README.md           # This file
```

## Database Schema

The database includes the following main tables:

- **profiles** - User profiles with roles (FARMER, SUPPLIER, WORKER, ENGINEER)
- **product_categories** - Product categorization
- **products** - Marketplace products
- **conversations** - Chat conversations between users
- **messages** - Individual chat messages

## Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:
- Users can only access their own data
- Public read access for product categories and active products
- Conversation participants can access their messages

## Edge Functions

### moderate-content
Content moderation function for chat messages and product descriptions.
- Filters inappropriate language
- Detects suspicious patterns
- Returns moderation results with suggestions

### send-notification
Notification service for push notifications and alerts.
- Handles different notification types
- Logs notifications for development
- Extensible for production notification services

## Local Development

To work with Supabase locally:

```bash
# Start Supabase local development
supabase start

# Apply migrations
supabase db reset

# Deploy functions
supabase functions deploy moderate-content
supabase functions deploy send-notification
```

## Environment Variables

The following environment variables are automatically available in Edge Functions:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Production Deployment

Migrations and functions are automatically deployed when pushing to the main branch. Manual deployment:

```bash
# Deploy migrations
supabase db push

# Deploy specific function
supabase functions deploy moderate-content --project-ref your-project-ref
```