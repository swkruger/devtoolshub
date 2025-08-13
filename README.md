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

## 🚀 **DevToolsHub: Production-Ready Developer Tools Platform**

**9 Production-Ready Tools Available Now** • **Real-time Processing** • **Premium Features** • **Mobile-First Design**

### ✨ What Makes DevToolsHub Special

- **🎯 Professional Grade**: Each tool rivals the best standalone versions available online
- **⚡ Real-time Processing**: Live testing with debounced inputs and visual feedback
- **🎨 Consistent UX**: Unified design language with advanced highlighting systems
- **📱 Mobile-First**: Responsive design that works beautifully on all devices
- **🔐 Secure & Private**: Supabase auth with row-level security
- **🚀 Production Ready**: Successfully builds and deploys with zero errors

## 🏗 Quick Start

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

# OpenWeatherMap API (for World Clock weather features)
# Get your free API key at: https://openweathermap.org/api
OPENWEATHER_API_KEY=your_openweathermap_api_key

# Email Configuration
RESEND_API_KEY=your_resend_api_key
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

### 🆕 Recently Completed: Image Compressor (December 2024)
**Full-featured image compression tool with premium capabilities:**
- ✅ **Complete Implementation**: All planned features implemented and tested
- ✅ **Database Integration**: Full Supabase integration with saved settings and history
- ✅ **Premium Features**: Batch processing, format conversion, advanced settings
- ✅ **Performance Optimized**: Web Workers for heavy processing, memory management
- ✅ **User Experience**: Toast notifications, accessibility, responsive design
- ✅ **Documentation**: Comprehensive help panel and usage examples

### 🔐 Authentication & User Management
- **OAuth Integration**: Google & GitHub sign-in via Supabase
- **User Profiles**: Automatic profile creation with plan management
- **Route Protection**: Middleware-based auth for protected routes
- **Premium Plans**: Free/Premium user tiers with feature gating
- **Email Notifications**: Automated signup notifications and welcome emails

### 🛠 Tool System
**Modular Architecture**: Each tool is a pluggable Next.js route with its own UI and logic.

#### 🔐 JWT Decoder/Encoder Tool
The JWT Decoder/Encoder is a comprehensive tool for working with JSON Web Tokens:

**Free Features:**
- Decode JWT header, payload, and signature
- Syntax highlighting and validation
- Copy decoded payload to clipboard
- Show algorithm, type, and claims
- Token expiry and issued-at display
- Load sample JWT for testing
- Clear/reset editor functionality
- Comprehensive help panel with examples

**Premium Features:**
- Signature verification (HS256, RS256, ES256, etc.)
- JWT creation and encoding
- Bulk decode/upload/download operations
- Token Inspector with detailed claim explanations
- Save and manage JWTs in user profile
- File upload/download functionality
- Advanced algorithms support
- Premium keyboard shortcuts
- Expiry alerts and notifications

**Key Features:**
- **Real-time decoding**: Instant JWT parsing and validation
- **Comprehensive error handling**: Clear error messages for malformed tokens
- **Accessibility**: Full keyboard navigation and screen reader support
- **Premium gating**: Visual indicators for premium features with upgrade prompts
- **Database integration**: Secure JWT snippet storage with Supabase
- **File operations**: Upload JWT files and download decoded results
- **Help system**: Built-in documentation with examples and shortcuts

#### 📸 Image Compressor Tool

The Image Compressor is a comprehensive tool for optimizing images with advanced compression algorithms and format conversion capabilities.

**Free Features:**
- Single image upload and compression
- Adjustable quality control (1-100%)
- Basic format support (JPEG, PNG)
- Real-time compression preview
- File size comparison and statistics
- Before/after image comparison
- Basic error handling and validation
- Comprehensive help panel with examples

**Premium Features:**
- **Batch Processing**: Upload and compress multiple images simultaneously
- **Advanced Formats**: WebP and AVIF support for superior compression
- **Format Conversion**: Convert between JPEG, PNG, WebP, and AVIF
- **Advanced Settings**: Resize by dimensions or percentage, strip metadata
- **Progressive JPEG**: Enable progressive loading for better perceived performance
- **Lossless Compression**: Maintain quality while reducing file size
- **Bulk Download**: Download all compressed images as ZIP archive
- **Save Settings**: Save favorite compression configurations
- **Load Settings**: Apply saved compression presets
- **Compression History**: Track and manage past compression activities
- **Database Integration**: Secure storage of settings and history in Supabase

**Key Features:**
- **Web Worker Processing**: Offloads heavy compression to background threads
- **Memory Management**: Efficient handling of large image files
- **Progress Tracking**: Real-time progress indicators for batch operations
- **Accessibility**: Full keyboard navigation and screen reader support
- **Premium Gating**: Visual indicators for premium features with upgrade prompts
- **Toast Notifications**: Professional feedback for all operations
- **Responsive Design**: Works seamlessly on desktop and mobile devices

**Technical Implementation:**
- **Client-side Processing**: Uses HTML Canvas API for image manipulation
- **Web Workers**: Prevents UI freezing during heavy operations
- **Database Integration**: Supabase with Row Level Security for user data
- **File Validation**: Comprehensive file type and size validation
- **Error Handling**: Graceful error recovery with user-friendly messages

#### ⏰ Timestamp Converter Tool

The Timestamp Converter is a comprehensive tool for working with timestamps and dates with database-backed timezone preferences:

**Free Features:**
- Unix timestamp to human-readable date conversion
- Date to Unix timestamp conversion
- Real-time bidirectional conversion with active field tracking
- Current timestamp display with auto-update
- Basic timezone support (UTC, Local, common zones)
- Multiple output formats (ISO 8601, locale, custom patterns)
- Millisecond precision handling
- Individual copy buttons for all formats
- Input validation and error handling
- Help panel with examples and shortcuts

**Premium Features:**
- **Database-backed timezone preferences**: Save and sync timezone configurations across devices
- **Enhanced timezone comparison**: Unix and ISO format display with separate copy buttons
- **Batch timestamp conversion**: Process up to 1000 timestamps from CSV/text
- **Persistent timezone settings**: Automatically load saved timezone preferences
- **Custom date format patterns**: strftime and moment.js style patterns
- **Advanced timezone features**: Default timezone protection, display order management
- **CSV/JSON export**: Export conversion results and timezone comparisons
- **File upload support**: Batch processing from uploaded files
- **Premium keyboard shortcuts**: Advanced hotkeys for power users

**Key Features:**
- **Enhanced UI**: Streamlined 3-tab interface (Single, Batch, Current & Compare)
- **Database integration**: Supabase-backed timezone preference storage for premium users
- **Real-time conversion**: Instant bidirectional timestamp parsing with format change detection
- **Multiple copy options**: Individual copy buttons for Unix timestamps, ISO format, and formatted time
- **Timezone awareness**: Support for major world timezones with DST handling and database persistence
- **Combined functionality**: Current timestamp and timezone comparison in unified interface
- **Premium gating**: Visual indicators for premium features with upgrade prompts
- **Accessibility**: Full keyboard navigation and screen reader support

#### Current Tools:

| Tool | Status | Description |
|------|---------|-------------|
| 🌍 World Clock & Time Zones | ✅ Complete | Compare timezones with meeting planner, weather data & date picker |
| 📄 JSON Formatter | ✅ Complete | Format, validate & beautify JSON with advanced features |
| 🔍 Regex Tester | ✅ Complete | Test regex patterns with multi-language support & visualization |
| 🔐 JWT Decoder/Encoder | ✅ Complete | Decode, encode & verify JSON Web Tokens with bulk processing |
| 📸 Image Compressor | ✅ Complete | Compress & optimize images with batch processing & format conversion |
| 🧬 UUID Generator | ✅ Complete | Generate unique identifiers in various formats with namespace management |
| 🧪 XPath/CSS Selector Tester | ✅ Complete | Test XPath & CSS selectors with real-time element highlighting |
| ⏰ Timestamp Converter | ✅ Complete | Convert timestamps & dates with timezone support & batch processing |
| 🔄 Base64 Encoder | ✅ Complete | Encode/decode Base64 data with file support & premium features |

### 🏆 Recent Achievements (January 2025)
- ✅ **9 Complete Tools**: All core developer tools fully implemented and tested
- ✅ **NEW World Clock & Time Zone Converter**: Compare timezones with meeting planner, live weather data, date picker for any past/future dates, city persistence, business hours visualization, and advanced timezone navigation
- ✅ **Enhanced Base64 Encoder/Decoder**: Text & file encoding with URL-safe options, drag & drop, premium features
- ✅ **Enhanced Timestamp Converter**: Database-backed timezone preferences, combined Current & Compare tabs, Unix/ISO copy buttons
- ✅ **Streamlined UI**: 3-tab interface (Single, Batch, Current & Compare) for better user experience  
- ✅ **Premium Database Integration**: User timezone preferences stored in Supabase with full CRUD operations
- ✅ **Real-time Highlighting**: Advanced element highlighting in XPath/CSS Selector Tester
- ✅ **Multi-language Regex**: Support for JavaScript, Python, Java, Go regex engines
- ✅ **Advanced Image Processing**: WebP/AVIF conversion with batch processing
- ✅ **Production Ready**: Successful build pipeline with zero blocking errors
- ✅ **Updated Landing Page**: Accurate tool status and enhanced descriptions

### 🎨 UI/UX Features
- **Responsive Design**: Mobile-first with collapsible sidebar
- **Dark/Light Mode**: Automatic theme switching based on system preferences
- **Modern UI**: ShadCN components with Tailwind CSS
- **Accessibility**: WCAG compliant with full keyboard navigation
- **Real-time Feedback**: Live testing with debounced inputs and visual highlighting
- **Consistent UX**: Unified design patterns across all tools

### 📐 UI Consistency Standards
- Use compact headers via `ToolPageHeader` with 16px icons.
- Show premium info via `PremiumOverview` for free users; follow the crown pattern for disabled premium actions (free users see disabled + crown; premium users see enabled without crown).
- Icon sizing: w-3/h-3 or w-4/h-4 across headers, buttons, and help panels.
- Tabs: max 3-4 primary tabs; place crown on premium tabs or items.
- Help Panels: 4 tabs (Examples, Shortcuts, Tips, Accessibility) with consistent structure and icon sizes.
- Loading: use the shared `Spinner` for async states; pair with brief status text when appropriate.

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

**Example**: See the JWT Decoder/Encoder tool configuration in `lib/tools.ts` for a complete implementation with premium feature gating.

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
npm run docs:gen     # Generate static docs into /docs
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
| `OPENWEATHER_API_KEY` | OpenWeatherMap API key for weather data | ⚠️ |
| `RESEND_API_KEY` | Resend email service API key | ✅ |
| `FROM_EMAIL` | Verified sender email address | ⚠️ |
| `GOOGLE_SITE_VERIFICATION` | Google Search Console verification | ❌ |

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Documentation (Static)

- Generate static docs with `npm run docs:gen` (writes to `docs/`)
- Configure hosting for `docs/` (any static host). See `docs/README.md` for mapping to per-tool subdomains and sitemaps/feed

## 📚 Documentation Generator & Personalization

DevToolsHub includes a static documentation generator for every tool.

- Run generation: `npm run docs:gen`
  - Outputs to `docs/` and mirrors into `public/docs/` so pages are served at `/docs/*` locally and in production
  - Produces per-tool pages, `sitemap.xml`, `robots.txt`, and an Atom `feed.xml`
- Light/dark mode is supported (prefers-color-scheme).
- Public access: Unauthenticated `/tools/<slug>` requests are redirected to `/docs/<slug>` for a frictionless, crawlable experience.

### Per‑tool Content Overrides (Personalized Docs)

Place optional HTML fragments under `docs-content/<tool-slug>/` to override sections for any tool:

- `intro.html`: Introduction and value
- `how-it-works.html`: High‑level explanation of behavior
- `steps.html`: Step‑by‑step usage
- `examples.html`: Full HTML block for Examples (rendered verbatim)

Example:

```
docs-content/
  json-formatter/
    intro.html
    how-it-works.html
    steps.html
    examples.html
```

Re‑run `npm run docs:gen` to inject personalized content. If a file is absent, a sensible default is used.

### `/docs` Landing Page

- Auto‑generated professional index with a grid of tool cards
- Header navigation links back to the main app and sign‑in

### Linking From the App

- The home page tool cards show a docs icon linking directly to `/docs/<tool-id>`
- Top‑level shortcuts like `/world-clock` and `/json-formatter` rewrite to the corresponding docs for easy sharing

## 📝 Changelog Process

Changelog entries are code‑based for simple, reviewable updates.

- Source: `lib/changelog.ts`
- Type: `ChangelogEntry { date: string; title: string; tags?: string[]; items: string[] }`
- Page: `/changelog` renders all entries with dates, tags, and bullet points

Update policy:

- After each major tool development or notable change, append a new entry to `getChangelog()` with a clear date, concise title, and bullet points
- Keep entries user‑visible and task‑oriented; avoid internal refactors unless user‑impacting

Example entry:

```ts
{
  date: '2025-08-12',
  title: 'Public Docs & SEO',
  tags: ['docs', 'seo'],
  items: [
    'Added static docs with personalized overrides',
    'Redirect unauthenticated /tools/* to /docs/*',
  ],
}
```

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