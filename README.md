# DevToolsHub 🔧

**A comprehensive collection of developer tools in one platform**

DevToolsHub is designed for:
- Application developers
- QA engineers  
- Web scrapers
- API testers
- Frontend/UI/UX developers

It simplifies workflows by combining popular developer web tools into one extendable platform with a modular plugin structure.

## 🧱 Tech Stack

| Layer         | Technology                       |
|-----|----|
| Frontend     | Next.js 14 App Router + ShadCN UI|
| Styling      | Tailwind CSS + Radix UI          |
| Backend/API  | Next.js Server Actions / Routes  |
| Auth         | Supabase Auth (Google & GitHub)  |
| DB           | Supabase Postgres + Row Level Security |
| Storage      | Supabase Storage (for images/files) |
| Deployment   | Vercel (Recommended)             |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm
- Supabase account

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd devtools-hub
npm install
```

### 2. Environment Setup

Create `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

1. Create a new Supabase project
2. Run the migration script in Supabase SQL Editor:

```sql
-- Copy contents from db/migrations/001_create_users_table.sql
```

3. Configure OAuth providers in Supabase:
   - **Google OAuth**: Add your Google Client ID/Secret
   - **GitHub OAuth**: Add your GitHub Client ID/Secret
   - **Redirect URLs**: 
     - `http://localhost:3000/auth/callback` (development)
     - `https://your-domain.com/auth/callback` (production)

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```bash
.
├── app/                        # Next.js App Router structure
│   ├── (auth)/                # Auth routes (sign-in, callback)
│   ├── tools/                 # Tool modules (JSON, Regex, etc.)
│   │   ├── [tool-name]/       # Dynamic tool routes
│   │   └── layout.tsx         # Tools layout with auth
│   ├── dashboard/             # User dashboard/home  
│   ├── auth/                  # Auth callback handlers
│   ├── layout.tsx            # Root layout and providers
│   └── page.tsx              # Landing page
├── components/               # Shared UI components
│   ├── ui/                   # ShadCN base components
│   ├── shared/               # App-specific components
│   └── auth/                 # Authentication components
├── lib/                      # Client helpers, utilities
│   ├── supabase.ts           # Supabase client setup
│   ├── auth.ts               # Auth helpers
│   ├── tools.ts              # Tools configuration
│   └── utils.ts              # Utility functions
├── db/                       # Database schemas & migrations
│   ├── migrations/           # SQL migration scripts
│   └── rollbacks/            # Migration rollback scripts
├── middleware.ts             # Auth middleware
└── README.md                 # This file
```

## 🧩 Features

### 🔐 Authentication & User Management
- **OAuth Integration**: Google & GitHub sign-in via Supabase
- **User Profiles**: Automatic profile creation with plan management
- **Route Protection**: Middleware-based auth for protected routes
- **Premium Plans**: Free/Premium user tiers with feature gating

### 🛠 Tool System
**Modular Architecture**: Each tool is a pluggable Next.js route with its own UI and logic.

#### Current Tools:

| Tool | Status | Description |
|------|---------|-------------|
| 📄 JSON Formatter | Free | Format, validate & beautify JSON |
| 🔍 Regex Tester | Free | Test regex patterns with live matching |
| 🔐 JWT Decoder | Premium | Decode & verify JSON Web Tokens |
| 📸 Image Compressor | Premium | Compress & optimize images |
| 🧬 UUID Generator | Free | Generate unique identifiers |
| 🧪 XPath Tester | Premium | Test XPath & CSS selectors |
| ⏰ Timestamp Converter | Free | Convert timestamp formats |
| 🔄 Base64 Encoder | Free | Encode/decode Base64 data |

### 🎨 UI/UX Features
- **Responsive Design**: Mobile-first with collapsible sidebar
- **Dark/Light Mode**: Theme switching (coming soon)
- **Modern UI**: ShadCN components with Tailwind CSS
- **Accessibility**: WCAG compliant with keyboard navigation

## 🔧 Development

### Adding a New Tool

1. **Add Tool Configuration** in `lib/tools.ts`:

```typescript
'my-tool': {
  id: 'my-tool',
  name: 'My Tool',
  description: 'Tool description',
  shortDescription: 'Short description',
  icon: MyIcon,
  emoji: '🛠',
  isPremium: false,
  category: 'utility',
  tags: ['tag1', 'tag2'],
  path: '/tools/my-tool',
  features: {
    free: ['Feature 1', 'Feature 2'],
    premium: ['Premium Feature 1']
  }
}
```

2. **Create Tool Directory**:

```bash
mkdir -p app/tools/my-tool
```

3. **Create Tool Page** in `app/tools/my-tool/page.tsx`:

```tsx
export default function MyToolPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1>My Awesome Tool</h1>
      {/* Tool UI here */}
    </div>
  );
}
```

4. **Tool Config** (Optional) in `app/tools/my-tool/tool.config.ts`:

```typescript
export const toolConfig = {
  // Tool-specific configuration
};
```

### Database Migrations

**Creating a Migration:**

```bash
# Create new migration file
touch db/migrations/002_my_migration.sql
touch db/rollbacks/002_rollback_my_migration.sql
```

**Running Migrations:**
Execute SQL files directly in Supabase SQL Editor or use Supabase CLI.

### Code Style & Best Practices

- **TypeScript**: Strict mode enabled with proper typing
- **Components**: Use RSC (React Server Components) by default
- **Styling**: Tailwind-first with ShadCN components
- **File Organization**: Feature-based directory structure
- **Imports**: Use `@/` path aliases for clean imports

## 🚦 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server  
npm run lint         # Run ESLint
npm run db:generate  # Generate TypeScript types from Supabase
```

## 🔒 Security

- **Row Level Security (RLS)**: Enabled on all user tables
- **Environment Variables**: Never commit secrets to repository
- **Authentication**: Secure OAuth flows via Supabase
- **API Protection**: Server-side validation for all operations
- **CORS**: Properly configured for production domains

## 📋 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ✅ |
| `NEXT_PUBLIC_APP_URL` | Application base URL | ✅ |

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The app can be deployed to any platform supporting Next.js 14:
- Netlify
- Railway  
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-tool`
3. Make your changes following the code style
4. Add tests if applicable
5. Commit: `git commit -m 'Add amazing tool'`
6. Push: `git push origin feature/amazing-tool`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [ShadCN/UI](https://ui.shadcn.com/) - Component library
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Radix UI](https://www.radix-ui.com/) - Unstyled UI primitives

---

**Built with ❤️ for the developer community** 