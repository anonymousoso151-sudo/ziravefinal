# ZİRAVE Environment Setup Guide

## Overview
This guide explains how to configure the ZİRAVE application for different environments (local development and production).

## Environment Files Structure

### Mobile App (`mobile/`)
- `env.mobile` - Current production configuration
- `env.local` - Local development configuration
- `env.production` - Production configuration

### Web Dashboard (`web-dashboard/`)
- `env.local` - Local development configuration
- `env.production` - Production configuration

## Configuration Variables

### Supabase Configuration
- `EXPO_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (Web Dashboard only)

### App Configuration
- `EXPO_PUBLIC_APP_NAME` / `NEXT_PUBLIC_APP_NAME` - Application name
- `EXPO_PUBLIC_APP_VERSION` / `NEXT_PUBLIC_APP_VERSION` - Application version
- `EXPO_PUBLIC_API_URL` - Backend API URL

## Switching Environments

### For Local Development
1. **Mobile App**: Copy `env.local` to `env.mobile`
2. **Web Dashboard**: Copy `env.local` to `.env.local`

### For Production
1. **Mobile App**: Copy `env.production` to `env.mobile`
2. **Web Dashboard**: Copy `env.production` to `.env.local`

## Getting Supabase Keys

### Local Development
When running `supabase start`, the keys are displayed in the terminal:
```
API URL: http://127.0.0.1:54321
DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
Studio URL: http://127.0.0.1:54323
Inbucket URL: http://127.0.0.1:54324
JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Production
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings > API
4. Copy the URL and keys

## Security Notes
- Never commit environment files to Git
- Keep service role keys secure
- Use different keys for different environments
- Regularly rotate production keys

## Troubleshooting

### Common Issues
1. **"Supabase URL or Anon Key is missing"** - Check environment file exists and variables are set
2. **Connection refused** - Ensure Supabase is running locally or production URL is correct
3. **Authentication errors** - Verify keys are correct and not expired

### Verification Commands
```bash
# Check if Supabase is running locally
supabase status

# Verify environment variables are loaded
echo $EXPO_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_URL
```
