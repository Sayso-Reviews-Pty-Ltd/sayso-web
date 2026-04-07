# Getting Started with KLIO

This guide will help you get up and running with KLIO in your local development environment.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Git** for version control
- **Supabase** account (for backend services)

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd KLIO
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Copy the example environment file:

```bash
cp env.example .env.local
```

Edit `.env.local` and add your configuration:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: Overpass API (for business data seeding)
NEXT_PUBLIC_OVERPASS_API_URL=https://overpass-api.de/api/interpreter
```

### 4. Database Setup

Run the database migrations in order:

1. Navigate to your Supabase dashboard
2. Go to the SQL Editor
3. Run migrations from `src/app/lib/migrations/` in order:
   - Start with `001_core/`
   - Then `002_business/`
   - Then `003_reviews/`
   - Then `004_storage/`
   - Finally `005_functions/`

See [Migration README](../../src/app/lib/migrations/README.md) for detailed instructions.

### 5. Start Development Server

```bash
npm run dev
# or
yarn dev
```

Your app should now be running at `http://localhost:3000`

## Project Structure

```
KLIO/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   ├── components/        # React components
│   │   ├── contexts/          # React contexts
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utilities and services
│   │   │   ├── migrations/   # Database migrations
│   │   │   ├── services/     # Business logic services
│   │   │   └── utils/        # Helper functions
│   │   └── [pages]/          # Page components
│   ├── components/            # Atomic design components
│   │   ├── atoms/
│   │   ├── molecules/
│   │   └── organisms/
│   └── types/                 # TypeScript type definitions
├── docs/                      # Documentation
├── public/                    # Static assets
└── tests/                     # Test files
```

## Key Features to Explore

### 1. User Authentication

- Sign up and login at `/login` or `/signup`
- Test the onboarding flow with interests selection

### 2. Business Discovery

- Browse businesses by category on the home page
- Search for specific businesses
- View detailed business pages

### 3. Reviews System

- Leave reviews for businesses (requires authentication)
- Upload photos with reviews
- Rate businesses on multiple criteria

### 4. Business Management (For Business Owners)

- Claim a business at `/claim-business`
- Manage your business at `/manage-business`
- Edit business details
- Respond to reviews

### 5. Admin Features

- Seed database with businesses at `/admin/seed`
- View system analytics

## Development Workflow

### Running Tests

```bash
npm run test
# or
yarn test
```

### Linting

```bash
npm run lint
# or
yarn lint
```

### Type Checking

```bash
npm run type-check
# or
yarn type-check
```

## Common Tasks

### Adding a New Page

1. Create a new directory in `src/app/`
2. Add a `page.tsx` file
3. Follow the Next.js App Router conventions

### Creating a New Component

1. Choose the appropriate atomic design level (atoms/molecules/organisms)
2. Create the component file
3. Export it from the index file
4. Import and use in your pages

### Adding an API Route

1. Create a new directory under `src/app/api/`
2. Add a `route.ts` file
3. Export GET, POST, PUT, DELETE handlers as needed

## Troubleshooting

### Build Errors

- Clear `.next` directory: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run type-check`

### Database Issues

- Verify Supabase credentials in `.env.local`
- Check that migrations have been run in order
- Verify RLS policies are enabled

### Environment Variables

- Ensure all required variables are set in `.env.local`
- Restart the dev server after changing environment variables
- Don't commit `.env.local` to version control

## Next Steps

- Read the [Project Overview](PROJECT_OVERVIEW.md) to understand the architecture
- Check out the [Setup Guide](SETUP.md) for advanced configuration
- Explore the [Feature Documentation](../03_features/) to learn about specific features
- Review the [Design System](../../src/app/design-system/README.md) for UI components

## Getting Help

- Check existing documentation in the `docs/` directory
- Review code comments in the source files
- Look at example implementations in existing pages/components

Happy coding! 🚀
