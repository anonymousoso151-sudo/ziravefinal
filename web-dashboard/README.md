# ZİRAVE Web Dashboard

This is the administrative and analytics web interface for the ZİRAVE agricultural platform, built with Next.js 14.

## Features

- **Dashboard Analytics** - Real-time platform statistics and insights
- **User Management** - Admin tools for managing platform users
- **Product Management** - Tools for managing marketplace products
- **Content Moderation** - Chat and content moderation tools
- **Reporting** - Comprehensive reporting and analytics

## Tech Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **State Management:** Zustand
- **UI Components:** Headless UI / Radix UI
- **Charts:** Recharts
- **Authentication:** Supabase Auth

## Getting Started

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
web-dashboard/
├── src/
│   ├── app/           # Next.js App Router pages
│   ├── components/    # Reusable UI components
│   ├── lib/          # Utilities and configurations
│   ├── hooks/        # Custom React hooks
│   ├── stores/       # Zustand stores
│   └── types/        # TypeScript type definitions
├── public/           # Static assets
└── ...config files
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

## Development

This project follows the ZİRAVE development standards:
- TypeScript for type safety
- Tailwind CSS for styling
- ESLint and Prettier for code quality
- Modular component architecture