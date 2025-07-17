# DevToolsHub Migration Instructions

This document provides step-by-step instructions for setting up DevToolsHub in your environment.

## 🚀 Quick Start

### 1. Environment Setup

Create a `.env.local` file in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Email Configuration (Resend)
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=contactme@devtoolskithub.com

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Database Setup

Run the database migrations in order:

```bash
# Apply migrations
psql -h your_supabase_host -U postgres -d your_database -f db/migrations/001_create_users_table.sql
psql -h your_supabase_host -U postgres -d your_database -f db/migrations/002_create_json_snippets_table.sql
```

### 3. Email Service Setup

#### Step 1: Create Resend Account
1. Go to [resend.com](https://resend.com) and sign up
2. Navigate to API Keys in your dashboard
3. Create a new API key (free tier allows 100 emails/day)
4. Copy the API key (starts with `re_`)

#### Step 2: Domain Verification
1. In Resend dashboard, go to Domains
2. Add your domain: `contactme.devtoolskithub.com`
3. Follow the DNS verification steps
4. Once verified, you can send emails to any recipient

#### Step 3: Update Environment
Add your Resend API key to `.env.local`:
```env
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=contactme@devtoolskithub.com
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Start Development Server

```bash
npm run dev
```

## 📧 Email Testing

Test the email system with these commands:

```bash
# Basic test email
curl "http://localhost:3000/api/test-email"

# New user notification test
curl "http://localhost:3000/api/test-email?type=new-user"

# Test with specific email
curl "http://localhost:3000/api/test-email?email=your-email@example.com"
```

## 🔧 Production Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

```env
# Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_supabase_service_role_key

# Email (Production)
RESEND_API_KEY=your_production_resend_api_key
FROM_EMAIL=contactme@devtoolskithub.com

# App (Production)
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### JSON Snippets Table
```sql
CREATE TABLE json_snippets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔒 Security Considerations

1. **Environment Variables**: Never commit `.env.local` to version control
2. **API Keys**: Rotate Resend API keys regularly
3. **Database**: Use Row Level Security (RLS) policies in Supabase
4. **Email**: Verify your domain in Resend before production use

## 🐛 Troubleshooting

### Email Issues
- **Domain not verified**: Complete DNS verification in Resend dashboard
- **API key missing**: Check `RESEND_API_KEY` in environment variables
- **Rate limiting**: Free tier allows 100 emails/day

### Database Issues
- **Connection failed**: Verify Supabase credentials
- **Migration errors**: Run migrations in order (001, 002, etc.)
- **RLS policies**: Ensure proper policies are in place

### Build Issues
- **TypeScript errors**: Run `npm run type-check`
- **Linting errors**: Run `npm run lint`
- **Missing dependencies**: Run `npm install`

## 📞 Support

For technical support or questions:
- Email: contactme@devtoolskithub.com
- GitHub Issues: [Create an issue](https://github.com/yourusername/devtools-hub/issues)

## 🔄 Rollback Instructions

If you need to rollback changes:

```bash
# Rollback database changes
psql -h your_supabase_host -U postgres -d your_database -f db/rollbacks/002_rollback_json_snippets_table.sql
psql -h your_supabase_host -U postgres -d your_database -f db/rollbacks/001_rollback_users_table.sql
```

## 📝 Changelog

### v0.1.0
- Initial release with 8 developer tools
- Supabase authentication integration
- Email notification system with Resend
- Professional landing page with SEO optimization
- Responsive design with Tailwind CSS 