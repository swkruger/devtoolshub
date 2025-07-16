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
- **Email Notifications**: Automated signup notifications and welcome emails

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

### 📧 Email System
- **Resend Integration**: Modern email API for reliable delivery
- **New User Notifications**: Automatic admin notifications for signups
- **Welcome Emails**: Branded welcome messages for new users
- **React Email Templates**: Professional, responsive email designs
- **Email Testing**: Built-in test endpoints for development

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

### Email Service Testing

**Test Email Functionality:**

```bash
# Send basic test email
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"testType": "basic"}'

# Send test new user notification
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"testType": "new-user"}'
```

**Setup Requirements:**
1. Create Resend account at [resend.com](https://resend.com)
2. Get API key from Resend dashboard
3. Add `RESEND_API_KEY` to `.env.local`
4. Set `FROM_EMAIL` (use `onboarding@resend.dev` for testing)

### Code Style & Best Practices

- **TypeScript**: Strict mode enabled with proper typing
- **Components**: Use RSC (React Server Components) by default
- **Styling**: Tailwind-first with ShadCN components
- **File Organization**: Feature-based directory structure
- **Imports**: Use `@/` path aliases for clean imports

## 🏗️ Tool Development Guidelines

*Use these guidelines when developing new tools to ensure consistency, quality, and maintainability.*

### 📐 Architecture Patterns

#### Component Structure
Each tool should follow this component organization:

```bash
app/tools/[tool-name]/
├── page.tsx                    # Server component wrapper
├── components/
│   ├── [tool-name]-client.tsx  # Main client component
│   ├── [tool-name]-editor.tsx  # Core editor/input component
│   ├── help-panel.tsx         # Help documentation
│   ├── enhanced-tooltip.tsx   # Rich tooltips
│   └── keyboard-shortcuts.tsx # Keyboard shortcuts
├── hooks/
│   ├── use-[tool-name].tsx    # Core tool logic
│   └── use-keyboard-shortcuts.tsx # Keyboard shortcuts
├── lib/
│   ├── [tool-name]-utils.ts   # Utility functions
│   └── [tool-name]-types.ts   # TypeScript types
└── tool.config.ts             # Tool configuration
```

#### Single Responsibility Components
- **Main Component**: Layout and state management
- **Editor Component**: Core tool functionality
- **Help Panel**: Documentation and examples
- **Tooltip Component**: Rich contextual help
- **Hooks**: Business logic and side effects

### 🎨 Design Principles

#### UI Consistency Standards
**All tools must follow these layout patterns to maintain a cohesive user experience:**

**Page Header Pattern (Current Standard):**
```tsx
// Compact header layout - DO USE THIS
<div className="container mx-auto px-4 py-4 max-w-7xl">
  <div className="flex items-center gap-3 mb-4">
    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20">
      <ToolIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
    </div>
    <div>
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {tool.name}
      </h1>
    </div>
  </div>
  {/* Tool content */}
</div>
```

**Card Header Pattern:**
```tsx
// Clean card headers without redundant titles
<Card>
  <CardHeader className="pb-4">
    {/* Avoid duplicate tool titles */}
    {/* Keep headers minimal or remove entirely */}
  </CardHeader>
  <CardContent>
    {/* Main tool interface */}
  </CardContent>
</Card>
```

**Input Group Patterns:**
```tsx
// Related inputs should be grouped horizontally when space allows
<div className="flex gap-3">
  <div className="flex-1">
    <Input placeholder="Main input" />
  </div>
  <div className="flex items-center gap-2 min-w-0">
    <span className="text-sm text-muted-foreground whitespace-nowrap">Option:</span>
    <select className="min-w-[120px]">
      <option>Choice</option>
    </select>
  </div>
</div>
```

**❌ Avoid These Patterns:**
- Large tool headers with redundant titles (e.g., "JSON Formatter" in both page header and card header)
- Vertical layouts when horizontal grouping makes more sense
- Inconsistent spacing and typography scales
- Different button toolbar patterns between tools

#### Consistent UI Framework
```tsx
// Standard tool layout pattern
<div className="container mx-auto px-4 py-4 max-w-7xl">
  {/* Compact header only */}
  <div className="flex items-center gap-3 mb-4">
    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20">
      <ToolIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
    </div>
    <div>
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {tool.name}
      </h1>
    </div>
  </div>
  
  {/* Main tool interface */}
  <ToolClientComponent />
  
  {/* Premium feature overview for free users */}
  {!isPremiumUser && <PremiumFeatureCards />}
</div>
```

#### Button Toolbar Standards
```tsx
// Standard button toolbar pattern
<div className="flex flex-wrap gap-2 mb-4">
  <div className="flex gap-2">
    {/* Primary actions */}
    <Button onClick={handlePrimaryAction}>
      <Icon className="h-4 w-4 mr-2" />
      Primary Action
    </Button>
  </div>
  
  <div className="flex gap-2">
    {/* Secondary actions */}
    <Button variant="outline" onClick={handleSecondaryAction}>
      <Icon className="h-4 w-4 mr-2" />
      Secondary Action
    </Button>
  </div>
  
  <div className="flex gap-2 ml-auto">
    {/* Utility actions */}
    <Button variant="ghost" size="sm" onClick={handleUtility}>
      <Icon className="h-4 w-4" />
    </Button>
  </div>
</div>
```

### 💎 Premium Feature Integration

#### Visual Premium Indicators
```tsx
// Premium feature pattern
<EnhancedTooltip
  content={
    <div>
      <p>Premium Feature</p>
      <p className="text-sm text-muted-foreground">
        Upgrade to access this feature
      </p>
    </div>
  }
  showPremiumBadge={!isPremium}
>
  <Button 
    disabled={!isPremium}
    onClick={handlePremiumAction}
  >
    {!isPremium && <Crown className="h-4 w-4 mr-2" />}
    Premium Action
  </Button>
</EnhancedTooltip>
```

#### Premium Feature Behavior
- **FREE users**: Show disabled button with crown icon
- **PREMIUM users**: Show enabled button without crown icon
- **Upgrade prompts**: Use toast notifications with clear CTA
- **Consistent messaging**: "This feature requires a premium plan"

### 📚 Documentation Standards

#### Help Panel Structure
Every tool must include a comprehensive help panel with:

```tsx
// Help panel tabs structure
<Tabs defaultValue="examples">
  <TabsList className="grid w-full grid-cols-4">
    <TabsTrigger value="examples">Examples</TabsTrigger>
    <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
    <TabsTrigger value="tips">Tips</TabsTrigger>
    <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
  </TabsList>
  
  <TabsContent value="examples">
    {/* 3-5 practical examples */}
  </TabsContent>
  
  <TabsContent value="shortcuts">
    {/* All keyboard shortcuts */}
  </TabsContent>
  
  <TabsContent value="tips">
    {/* Usage tips and best practices */}
  </TabsContent>
  
  <TabsContent value="accessibility">
    {/* Accessibility features */}
  </TabsContent>
</Tabs>
```

#### Enhanced Tooltips
```tsx
// Rich tooltip pattern
<EnhancedTooltip
  content={
    <div>
      <div className="font-semibold mb-1">Action Name</div>
      <div className="text-sm text-muted-foreground mb-2">
        Description of what this action does
      </div>
      <div className="text-xs bg-muted px-2 py-1 rounded">
        Keyboard: Ctrl+K
      </div>
    </div>
  }
  examples={[
    "Example 1: Basic usage",
    "Example 2: Advanced usage"
  ]}
  tips={[
    "Tip 1: Performance optimization",
    "Tip 2: Best practices"
  ]}
>
  <Button>Action</Button>
</EnhancedTooltip>
```

### ⌨️ Keyboard Shortcuts Standards

#### Required Shortcuts
Every tool must implement these categories:

```tsx
// Standard keyboard shortcuts
const shortcuts = {
  // Core actions (F1-F12)
  'F1': { action: 'toggleHelp', description: 'Toggle help panel' },
  
  // Primary actions (Ctrl+Letter)
  'Ctrl+L': { action: 'loadSample', description: 'Load sample data' },
  'Ctrl+R': { action: 'clearEditor', description: 'Clear/reset editor' },
  
  // Secondary actions (Ctrl+Shift+Letter)
  'Ctrl+Shift+F': { action: 'formatContent', description: 'Format content' },
  'Ctrl+Shift+C': { action: 'compactContent', description: 'Compact content' },
  
  // Utility actions (Alt+Letter)
  'Alt+C': { action: 'copyContent', description: 'Copy to clipboard' },
  'Alt+D': { action: 'downloadFile', description: 'Download file' },
  'Alt+S': { action: 'saveSnippet', description: 'Save snippet' },
  'Alt+L': { action: 'loadSnippet', description: 'Load snippet' },
  
  // Premium actions (Ctrl+Alt+Letter)
  'Ctrl+Alt+U': { action: 'uploadFile', description: 'Upload file', premium: true },
  'Ctrl+Alt+T': { action: 'toggleTree', description: 'Toggle tree view', premium: true }
};
```

#### Keyboard Shortcut Implementation
```tsx
// Keyboard shortcuts hook pattern
const useKeyboardShortcuts = (handlers: ShortcutHandlers) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = `${e.ctrlKey ? 'Ctrl+' : ''}${e.shiftKey ? 'Shift+' : ''}${e.altKey ? 'Alt+' : ''}${e.key}`;
      
      if (shortcuts[key]) {
        e.preventDefault();
        handlers[shortcuts[key].action]?.();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
};
```

### ♿ Accessibility Standards

#### Required Accessibility Features
```tsx
// Accessibility implementation
<div
  role="region"
  aria-label="Tool interface"
  aria-describedby="tool-description"
>
  <div id="tool-description" className="sr-only">
    {tool.description}
  </div>
  
  <Button
    aria-label="Format JSON content"
    aria-describedby="format-help"
    onClick={handleFormat}
  >
    <Icon className="h-4 w-4" aria-hidden="true" />
    Format
  </Button>
  
  <div id="format-help" className="sr-only">
    Formats and beautifies JSON with proper indentation
  </div>
</div>
```

#### Screen Reader Support
- **ARIA labels**: Descriptive labels for all interactive elements
- **Role attributes**: Proper semantic roles for complex components
- **Live regions**: Announce dynamic content changes
- **Skip links**: Navigation shortcuts for keyboard users

### 🎯 Performance Standards

#### Loading States
```tsx
// Loading state pattern
{isLoading ? (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    <span className="ml-2">Processing...</span>
  </div>
) : (
  <ToolContent />
)}
```

#### Debounced Operations
```tsx
// Debounced validation pattern
const debouncedValidate = useCallback(
  debounce((content: string) => {
    try {
      JSON.parse(content);
      setErrors([]);
    } catch (error) {
      setErrors([error.message]);
    }
  }, 300),
  []
);
```

### 🧪 Testing Standards

#### Component Testing
```tsx
// Test structure for each tool
describe('ToolName', () => {
  it('renders correctly', () => {
    render(<ToolName />);
    expect(screen.getByText('Tool Name')).toBeInTheDocument();
  });
  
  it('handles basic functionality', () => {
    // Test core features
  });
  
  it('handles premium features correctly', () => {
    // Test premium feature gates
  });
  
  it('implements keyboard shortcuts', () => {
    // Test keyboard shortcuts
  });
  
  it('meets accessibility requirements', () => {
    // Test accessibility features
  });
});
```

### 📋 Quality Checklist

Before marking a tool as complete, verify:

- [ ] **Architecture**: Follows component structure standards
- [ ] **UI/UX**: Consistent with design principles
- [ ] **UI Consistency**: Matches established layout patterns
  - [ ] Uses compact header pattern (text-xl, py-4)
  - [ ] Avoids redundant titles in card headers
  - [ ] Groups related inputs horizontally when appropriate
  - [ ] Follows button toolbar standards
  - [ ] Consistent spacing and typography scales
- [ ] **Premium Features**: Proper visual indicators and behavior
- [ ] **Documentation**: Complete help panel with all tabs
- [ ] **Keyboard Shortcuts**: All required shortcuts implemented
- [ ] **Accessibility**: ARIA labels and screen reader support
- [ ] **Performance**: Loading states and debounced operations
- [ ] **Testing**: Unit tests covering core functionality
- [ ] **Responsive**: Works on mobile and desktop
- [ ] **Error Handling**: Graceful error boundaries and messaging

### 📝 Development Workflow

1. **Planning**: Define tool requirements and feature matrix
2. **Setup**: Create folder structure and configuration
3. **Core Implementation**: Build basic functionality
4. **UI/UX**: Implement design standards
5. **Consistency Check**: Compare with JSON Formatter and Regex Tester layouts
6. **Premium Features**: Add premium feature gates
7. **Documentation**: Create comprehensive help system
8. **Accessibility**: Implement ARIA and keyboard support
9. **Testing**: Write unit tests and manual testing
10. **Optimization**: Add performance improvements
11. **Review**: Complete quality checklist

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
| `RESEND_API_KEY` | Resend email service API key | ✅ |
| `FROM_EMAIL` | Verified sender email address | ⚠️ |
| `GOOGLE_SITE_VERIFICATION` | Google Search Console verification | ❌ |

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