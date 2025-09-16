# Bold Routes Partners Web App

A modern web application for managing real estate partnerships, built with React, TypeScript, and Supabase.

## Features

- **Partner Applications**: Streamlined application process for new partners
- **Deal Management**: Submit and track closed deals with file attachments
- **Inventory Browsing**: View available properties with advanced filtering
- **Commission Tracking**: Real-time commission calculations and tracking
- **Launch Calendar**: Stay updated on new project launches
- **Admin Panel**: Comprehensive admin interface for managing all aspects of the platform
- **Mobile-First Design**: Responsive design that works on all devices

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **State Management**: Zustand
- **Routing**: React Router
- **Forms**: React Hook Form with Zod validation

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd partners-web-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the database migration (see Admin Setup section below)

5. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Admin Setup

### 1. Database Migration

Before using the admin panel, you need to run the database migration:

**Option A: Supabase Dashboard (Recommended)**
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/001_admin_panel.sql`
4. Click "Run" to execute the migration

**Option B: Command Line**
```bash
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" -f supabase/migrations/001_admin_panel.sql
```

### 2. Set Admin Access

After running the migration:
1. Go to Supabase Dashboard → Table Editor
2. Open the `profiles` table
3. Find your user record (created after first sign-in)
4. Set the `role` column to `'admin'`
5. Save the changes

### 3. Access Admin Panel

Navigate to `/admin` in your application. You'll be prompted to sign in with your admin email.

## Admin Panel Features

The admin panel provides comprehensive management capabilities:

- **Dashboard**: KPIs and system overview
- **Applications**: Review and manage partnership applications
- **Deals**: Review, verify, and manage closed deals
- **Developers**: CRUD operations for developer companies
- **Projects**: Manage real estate projects
- **Commission Rates**: Configure partner commission structures
- **Launches**: Manage project launch events
- **Inventory**: Manage available property units
- **Users**: User role management
- **Settings**: System configuration and information

### Admin Panel Features:
- Server-side pagination (20 items per page)
- Advanced filtering and search
- CSV export functionality
- File attachment management with signed URLs
- Bulk operations for deals
- Real-time status updates
- Mobile-responsive design

## Supabase Setup

### Database Schema

The application requires the following tables in your Supabase database:

1. **developers** - Real estate developer companies
2. **projects** - Development projects  
3. **commission_rates** - Partner commission structures
4. **launches** - Project launch events
5. **inventory_items** - Available property units
6. **partner_applications** - Partnership applications (with status/notes)
7. **closed_deals** - Completed transactions (with review status)
8. **profiles** - User profile data (with roles)

### Storage

Create a storage bucket named `deal-attachments` for file uploads. The migration automatically configures security policies.

### Row Level Security (RLS)

Enable RLS on all tables. The migration includes comprehensive RLS policies:
- Anonymous users can insert applications and deals
- Admin users can read/update all data
- File uploads restricted to `deals/` path prefix
- Signed URLs only accessible to admins

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler

### Project Structure

```
src/
├── components/         # Reusable UI components
│   └── admin/         # Admin-specific components
├── pages/             # Page components
│   └── admin/         # Admin panel pages
├── hooks/             # Custom React hooks
├── store/             # Zustand state management
├── utils/             # Utility functions
├── contexts/          # React contexts
├── api/               # API layer for Supabase
├── schemas/           # Zod validation schemas
└── styles/            # Global styles
```

### Admin Components

The admin panel uses reusable primitives:
- **DataTable**: Server-driven pagination, filtering, CSV export
- **Drawer**: Right-side panel for detailed views and actions
- **Confirm**: Confirmation dialogs for destructive actions

All admin components follow a monochrome design system for consistency.

## Security

- Row Level Security (RLS) enabled on all tables
- File upload validation and restrictions (10MB, specific file types)
- Input sanitization and validation
- Authentication required for all actions
- Admin-only access for sensitive operations
- Rate limiting on deal submissions
- Secure file storage with path restrictions

## Database Migration Details

The admin panel migration (`001_admin_panel.sql`) adds:
- `created_at` timestamps and indexes for performance
- `status` and `notes` columns for applications
- `review_status` and `internal_note` columns for deals
- Unique constraints on project names per developer
- Updated storage policies for enhanced security

## Deployment

### Production Build

```bash
npm run build
```

### Deploy to Vercel

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Deploy to Netlify

1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Set environment variables in Netlify dashboard

## Configuration

### File Upload Limits
- Maximum file size: 10MB per file
- Maximum files: 5 per deal submission
- Allowed types: PDF, DOC, DOCX, JPG, PNG, WEBP

### Commission Rate Limits
- Commission percentages must be between 0% and 20%
- Project-specific rates override general developer rates

### Storage Policy
- Files uploaded to `deals/` prefix only
- Admin-only access to download files via signed URLs

## Troubleshooting

### Common Issues

1. **Admin panel not accessible**: Ensure migration is run and user role is set to 'admin'
2. **File upload fails**: Check storage bucket exists and policies are configured
3. **Database errors**: Verify all required tables exist and RLS policies are enabled

### Support

For issues and questions, please check the documentation or contact the development team.

## License

This project is proprietary and confidential.