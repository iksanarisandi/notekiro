# Simple Note App

A simple note-taking application built with Next.js, Clerk authentication, and Cloudflare D1.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Authentication**: Clerk
- **Database**: Cloudflare D1 (SQLite)
- **Styling**: Tailwind CSS
- **Deployment**: Cloudflare Pages

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Clerk account for authentication
- Cloudflare account for deployment
- Wrangler CLI installed (`npm install -g wrangler`)

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
├── app/                  # Next.js App Router pages
│   ├── notes/           # Note-related pages
│   ├── sign-in/         # Sign-in page
│   ├── sign-up/         # Sign-up page
│   └── page.tsx         # Dashboard/home page
├── components/           # React components
├── lib/                  # Utility functions and database client
├── types/                # TypeScript type definitions
├── migrations/           # Database migration files
├── public/               # Static assets
└── .kiro/               # Kiro specs and configuration
```

## Environment Variables

The application requires the following environment variables:

### Required for Development and Production

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key (public) | `pk_test_...` |
| `CLERK_SECRET_KEY` | Clerk secret key (private) | `sk_test_...` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Sign-in page URL | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Sign-up page URL | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Redirect URL after sign-in | `/` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Redirect URL after sign-up | `/` |

### Getting Clerk Credentials

1. Sign up for a free account at [clerk.com](https://clerk.com)
2. Create a new application
3. Copy the API keys from the dashboard
4. Add them to your `.env.local` file

## Database Setup (Cloudflare D1)

### 1. Create D1 Database

First, authenticate with Cloudflare:

```bash
wrangler login
```

Create a new D1 database:

```bash
wrangler d1 create notes-db
```

This will output a database ID. Copy this ID for the next step.

### 2. Update wrangler.toml

Update the `database_id` in `wrangler.toml` with your database ID:

```toml
[[d1_databases]]
binding = "DB"
database_name = "notes-db"
database_id = "your-database-id-here"
```

### 3. Run Database Migrations

Apply the database schema to your D1 database:

```bash
wrangler d1 execute notes-db --file=./migrations/0001_create_notes_table.sql
```

Verify the migration:

```bash
wrangler d1 execute notes-db --command="SELECT name FROM sqlite_master WHERE type='table';"
```

You should see the `notes` table listed.

### 4. Local Development with D1

For local development, create a local D1 database:

```bash
wrangler d1 execute notes-db --local --file=./migrations/0001_create_notes_table.sql
```

## Deployment to Cloudflare Pages

### Option 1: Deploy via Wrangler CLI

1. Build the application:

```bash
npm run build
```

2. Deploy to Cloudflare Pages:

```bash
npx wrangler pages deploy .next --project-name=simple-note-app
```

3. Set environment variables in Cloudflare dashboard:
   - Go to your Cloudflare Pages project
   - Navigate to Settings > Environment Variables
   - Add all the required environment variables listed above

### Option 2: Deploy via Git Integration

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Connect to Cloudflare Pages:
   - Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Go to Pages
   - Click "Create a project"
   - Connect your Git repository
   - Select the repository containing your app

3. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
   - **Root directory**: `/` (or leave empty)
   - **Environment variables**: Add all required variables

4. Configure D1 binding:
   - In your Cloudflare Pages project settings
   - Go to Settings > Functions
   - Add D1 database binding:
     - Variable name: `DB`
     - D1 database: Select your `notes-db`

5. Deploy:
   - Click "Save and Deploy"
   - Cloudflare will automatically build and deploy your app
   - Future commits to your main branch will trigger automatic deployments

### Post-Deployment Steps

1. Update Clerk settings:
   - Go to your Clerk dashboard
   - Add your Cloudflare Pages URL to the allowed origins
   - Update redirect URLs if needed

2. Test the deployment:
   - Visit your Cloudflare Pages URL
   - Test authentication flow
   - Create, read, update, and delete notes
   - Verify all functionality works as expected

### Troubleshooting Deployment

**Issue: Build fails with module errors**
- Ensure all dependencies are listed in `package.json`
- Check that Node.js version is compatible (18+)

**Issue: Authentication not working**
- Verify Clerk environment variables are set correctly
- Check that your Cloudflare Pages URL is added to Clerk's allowed origins

**Issue: Database connection fails**
- Verify D1 binding is configured correctly in Cloudflare Pages settings
- Check that database migrations have been applied
- Ensure `wrangler.toml` has the correct database ID

**Issue: Edge runtime errors**
- Some Node.js APIs are not available in edge runtime
- Check that all dependencies are edge-compatible
- Review Cloudflare Workers documentation for limitations

## Local Development with D1

To test with the actual D1 database locally:

1. Use Wrangler's local mode:

```bash
wrangler pages dev .next --d1=DB=notes-db
```

2. Or use the development server with local D1:

```bash
npm run dev
```

Note: Local development uses a local SQLite database that mimics D1 behavior.

## Features

- User authentication with Clerk
- Create, read, update, and delete notes
- Personal note management (users can only access their own notes)
- Responsive design with Tailwind CSS
- Edge runtime for optimal performance
- Secure data storage with Cloudflare D1

## Security

- All routes except sign-in/sign-up are protected by Clerk authentication
- Note ownership is validated on all CRUD operations
- SQL injection protection via prepared statements
- XSS protection via Next.js automatic escaping
- Environment variables for sensitive credentials

## Performance

- Deployed on Cloudflare's global edge network
- Low latency database access with D1
- Automatic code splitting with Next.js
- Optimized static asset delivery

## License

MIT
