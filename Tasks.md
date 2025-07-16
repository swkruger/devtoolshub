# DevToolsHub - Project Tasks

🧱 **Phase 1: Project Template & Core Architecture**
Goal: Build the foundational framework, UI system, auth, layout, routing, and Supabase integration.

## 🔧 Setup & Structure
✅ As a developer, I want the project bootstrapped using Next.js App Router with TypeScript, so I have a modern foundation.

✅ As a developer, I want Tailwind CSS and ShadCN UI installed and configured, so I can rapidly build beautiful UIs.

✅ As a developer, I want a base layout with a responsive sidebar and top navigation, so I can scaffold the user interface easily.

✅ As a developer, I want the project to support modular tool pages under /tools/[tool-name], so I can add tools independently.

✅ As a developer, I want shared UI components in components/ui/, so styling and behavior are consistent.

## 🔐 Supabase Auth & User Management
✅ As a user, I want to sign in with Google using Supabase OAuth, so I can access tools securely.

✅ As a user, I want to sign in with GitHub using Supabase OAuth, so I have an alternative login option.

✅ As a user, I want to see a "Sign In" button if not authenticated, so I know where to log in.

✅ As a user, I want to see my name and avatar in the top nav when logged in, so I know I'm authenticated.

✅ As a developer, I want authenticated routes protected via Supabase middleware, so unauthenticated users cannot access tool pages.

✅ As a user, I want my profile stored in Supabase (user ID, email, name, avatar, plan), so the app can manage free vs. premium access.

## 💳 User Plans (Free vs Premium)
✅ As a user, I want a default "free" plan assigned on signup, so I can access basic tools right away.

✅ As a developer, I want a user record in Supabase to include a plan column (free, premium), so I can restrict access to premium features.

✅ As a developer, I want to add RLS (Row Level Security) to prevent unauthorized premium access.

✅ As a user, I want to access all tools for free, so I can use basic functionality without upgrading.

---

🧩 **Phase 2: Tool Module Framework**
Goal: Enable scalable plugin-style tool pages with shared layout, metadata config, and access control.

✅ As a developer, I want each tool to live under /tools/[tool-name] with its own folder and config, so tools are easily maintainable.

⬜ As a user, I want to see a tool's title, description, and icon in a consistent header, so the UI feels cohesive.

✅ As a user, I want to see a searchable list of available tools on the dashboard, so I can find what I need.

✅ As a developer, I want to mark tools as free or premium features in their config file, so the UI can control feature access.

⬜ As a user, I want to see premium feature prompts within tools when I try to use advanced functionality.

---

🛠 **Phase 3: First Batch of Tool Modules**
Goal: Build core tools, each with free and premium functionality.

## 📄 JSON Formatter
⬜ As a user, I want to paste JSON and see it formatted with syntax highlighting (free), so I can debug quickly.

⬜ As a premium user, I want to download formatted JSON as a file, so I can save and share results.

⬜ As a premium user, I want to validate large (5MB+) JSON files, so I'm not limited by size.

## 🔍 RegEx Tester
⬜ As a user, I want to test a regular expression against a text input (free), so I can see matches live.

⬜ As a premium user, I want to get match group highlighting and error explanation, so I better understand my pattern.

⬜ As a premium user, I want to save and reuse regex patterns in my account.

## 🔐 JWT Decoder
⬜ As a user, I want to paste a JWT and decode its payload (free), so I can see token content.

⬜ As a premium user, I want to verify the token's signature with a public key, so I can validate secure JWTs.

⬜ As a premium user, I want to upload or store secret keys securely in my account.

## 📸 Image Compressor
⬜ As a user, I want to upload and compress one image (free), so I can reduce its file size.

⬜ As a premium user, I want to batch upload and compress multiple images at once.

⬜ As a premium user, I want to convert image formats (JPEG → WebP, PNG → AVIF).

## 🧬 UUID Generator
⬜ As a user, I want to generate UUID v4s on the fly (free), so I can use them in my code.

⬜ As a premium user, I want to generate bulk UUIDs and export them.

## 🧪 XPath/CSS Selector Tester
⬜ As a user, I want to test an XPath or CSS selector against a sample HTML (free), so I can extract values.

⬜ As a premium user, I want to upload custom HTML files or pages from URLs for testing.

## ⏰ Timestamp Converter
⬜ As a user, I want to convert Unix timestamps to human readable dates (free), so I can debug time-related issues.

⬜ As a premium user, I want to batch convert multiple timestamps and export results.

## 🔄 Base64 Encoder/Decoder
⬜ As a user, I want to encode/decode Base64 strings (free), so I can work with encoded data.

⬜ As a premium user, I want to encode/decode files and use multiple encoding formats.

---

💸 **Phase 4: Premium Upgrade & Payment Integration**
Goal: Let users upgrade to premium via Stripe.

⬜ As a user, I want to see a "Go Premium" button on the dashboard, so I can upgrade easily.

⬜ As a user, I want to be redirected to Stripe Checkout, so I can subscribe to a premium plan.

⬜ As a user, I want my Supabase plan field to update after successful payment.

⬜ As a user, I want to manage my subscription via a billing portal.

---

🔁 **Phase 5: User Experience Polish**
Goal: Smooth, beautiful app experience with saved state, user preferences, and help.

⬜ As a user, I want dark mode toggle and theme persistence (localStorage), so the UI fits my preference.

⬜ As a premium user, I want to save tool inputs (e.g. last JSON/Regex) per tool.

⬜ As a user, I want to favorite/star tools for quick access.

⬜ As a user, I want in-app documentation/help in each tool, so I can learn how to use it.

⬜ As a user, I want toast notifications for success/errors, so I get feedback on actions.

---

## 📋 Next Immediate Tasks

**Priority 1: Core Tool Implementation**
1. Build JSON Formatter tool page with syntax highlighting
2. Build Regex Tester with live pattern matching  
3. Build JWT Decoder with payload display
4. Build UUID Generator with copy functionality

**Priority 2: Premium Features**
1. Add premium feature sections to each tool
2. Implement upgrade prompts within tools
3. Add Stripe payment integration

**Priority 3: User Experience**
1. Add dark mode toggle
2. Implement tool favorites
3. Add help documentation
4. Add toast notifications

---

## 🆕 JSON Formatter Implementation Tasks (2024-12-28)

**Goal**: Implement a comprehensive JSON Formatter tool using react-ace with single editor layout, light/dark mode support, and free/premium feature tiers.

### 📋 Core Infrastructure Tasks
✅ **Task 1**: Set up JSON Formatter page structure
- Create page.tsx with proper tool layout and title
- Implement responsive container with proper spacing
- Add tool description and feature overview section

✅ **Task 2**: Implement React-Ace JSON Editor
- Configure ace editor with JSON mode and appropriate themes
- Set up light/dark theme switching based on user profile
- Configure editor settings (word wrap, line numbers, etc.)
- Add proper TypeScript types for ace editor configuration

✅ **Task 3**: Create action buttons toolbar
- Design horizontal toolbar with grouped buttons
- Implement button states (enabled/disabled/loading)
- Add premium feature visual indicators (crown icon)
- Ensure responsive design for mobile devices

### 🆓 Free Features Implementation
✅ **Task 4**: Basic JSON operations
- Format/beautify JSON with proper indentation
- Compact/minify JSON (remove whitespace)
- Sort object keys alphabetically (ascending/descending)
- Copy formatted JSON to clipboard functionality

✅ **Task 5**: JSON validation and error handling
- Real-time JSON syntax validation
- Display detailed error messages with line/column info
- Provide helpful tips for common JSON errors
- Highlight error location in editor

✅ **Task 6**: JSON repair functionality
- Fix common JSON issues (unescaped quotes, trailing commas)
- Remove comments and JSONP wrappers
- Convert JavaScript objects to valid JSON
- Handle mixed quote types and escape characters

✅ **Task 7**: Sample data and examples
- Provide medium-complexity sample JSON data
- Include examples of common data structures
- Add "Load Sample" button functionality
- Clear editor with confirmation dialog

### 💎 Premium Features Implementation  
✅ **Task 8**: File upload/download capabilities
- Implement file upload with drag & drop support
- Add file validation (size limits, type checking)
- Download formatted JSON as file with proper naming
- Support large file processing (>5MB for premium users)

✅ **Task 9**: Format conversion tools
- JSON to XML conversion with proper formatting
- JSON to CSV conversion with nested object handling
- JSON to YAML conversion with proper indentation
- Reverse conversions (XML/CSV/YAML to JSON)

✅ **Task 10**: JSON tree visualization
- Implement collapsible tree view using react-json-tree
- Position tree view below editor with proper spacing
- Add expand/collapse all functionality
- Implement search within tree view

✅ **Task 11**: Online snippet management
- Save JSON snippets to user's Supabase profile
- Retrieve and load saved snippets
- Implement snippet naming and categorization
- Add snippet sharing capabilities (optional)

### 🎨 UI/UX Enhancement Tasks
✅ **Task 12**: Theme and styling integration
- Implement light/dark mode ace editor themes
- Ensure consistent styling with app theme
- Add proper loading states and animations
- Implement toast notifications for user actions

✅ **Task 13**: Premium feature gates
- Show premium buttons with crown icon when disabled
- Display upgrade prompts when premium features are accessed
- Implement smooth transitions for feature availability
- Add tooltips explaining premium benefits

✅ **Task 14**: Error handling and user feedback
- Implement comprehensive error boundaries
- Add progress indicators for long operations
- Show success/error toasts for all actions
- Handle edge cases gracefully

### 🧪 Testing and Polish Tasks
✅ **Task 15**: Testing and validation
- Test with various JSON structures and sizes
- Validate format conversions accuracy
- Test responsive design across devices
- Verify premium/free feature access control

✅ **Task 16**: Performance optimization
- Implement debounced validation for large files
- Optimize editor rendering for better performance
- Add loading states for heavy operations
- Implement proper error recovery

✅ **Task 17**: Documentation and help
- Add inline help tooltips for complex features
- Create tool usage examples and tips
- Implement keyboard shortcuts documentation
- Add accessibility features (ARIA labels, etc.)

---

## 🆕 Regex Tester Implementation Tasks (2024-12-28)

**Goal**: Implement the best regex testing tool available for developers with multi-language support, real-time testing, and comprehensive debugging features.

### 📋 Core Infrastructure Tasks  
✅ **Task 1**: Set up Regex Tester page structure and architecture
- Created comprehensive directory structure following JSON formatter patterns
- Implemented main page.tsx with proper tool layout and metadata
- Set up modular component architecture for extensibility

✅ **Task 2**: Implement Multi-Language Regex Engine System
- Created regex-engines.ts library with support for JavaScript, Python, Java, Go
- Implemented engine interface with validation, testing, and language-specific behavior
- Added language-specific flags, limitations, and feature differences
- Created comprehensive common patterns library with 8+ examples

✅ **Task 3**: Build Core Regex Testing Interface
- Implemented real-time regex pattern testing with live feedback
- Added comprehensive flag support with language-specific options
- Created detailed match results with capture groups and named groups
- Added execution time measurement and performance metrics

### 🆓 Free Features Implementation
✅ **Task 4**: JavaScript Regex Engine (Default)
- Native JavaScript RegExp engine integration
- Support for all JavaScript regex flags (g, i, m, s, u, y)
- Real-time pattern validation and error reporting
- Comprehensive match highlighting and group analysis

✅ **Task 5**: Basic Pattern Testing Features
- Live pattern matching with immediate feedback
- Match count and position information
- Basic capture group display with numbered groups
- Copy matches to clipboard functionality
- Sample pattern loading (email validation example)

✅ **Task 6**: User Interface and Experience
- Clean, intuitive interface with responsive design
- Pattern input with syntax validation
- Test text editor with match highlighting capabilities
- Action buttons for test, clear, copy, and load sample
- Execution time display for performance awareness

### 💎 Premium Features Implementation
✅ **Task 7**: Multi-Language Engine Support
- Python regex engine (re module simulation)
- Java regex engine (Pattern class simulation)  
- Go regex engine (RE2 limitations and behavior)
- Premium-gated language switching with upgrade prompts
- Language-specific behavior notes and documentation

⬜ **Task 8**: Advanced Pattern Analysis (Premium)
- Pattern explanation and breakdown functionality
- Regex visualization with flow diagrams
- Complex pattern suggestions and auto-completion
- Advanced performance analysis and ReDoS detection

⬜ **Task 9**: Pattern Library and Management (Premium)
- Comprehensive pattern library with 100+ examples
- Save and manage custom patterns in user account
- Pattern categorization and search functionality
- Import/export pattern collections

⬜ **Task 10**: Advanced Testing Features (Premium)
- Replace functionality with capture group references
- Bulk testing with file upload support
- Advanced match analytics and statistics
- Pattern optimization suggestions

### 🎨 UI/UX Enhancement Tasks
✅ **Task 11**: Language Switching Interface
- Dropdown language selector with premium indicators
- Language-specific flag support and documentation
- Real-time engine switching with pattern re-testing
- Visual indicators for premium-only languages

✅ **Task 12**: Match Results Enhancement
- Detailed match breakdown with position information
- Color-coded capture groups and named groups
- Match numbering and visual hierarchy
- Language and flag information display

⬜ **Task 13**: Premium Feature Integration
- Comprehensive upgrade prompts for premium features
- Consistent premium UI patterns with crown icons
- Feature comparison between free and premium tiers
- Smooth upgrade flow integration

### 🧪 Testing and Validation Tasks
⬜ **Task 14**: Cross-Language Testing
- Validate regex behavior differences across languages
- Test engine-specific limitations and features
- Verify error handling for unsupported constructs
- Performance testing across different engines

⬜ **Task 15**: User Experience Testing
- Test responsive design across devices
- Validate keyboard shortcuts and accessibility
- Test premium feature gates and upgrade flows
- Comprehensive error scenario testing

---

## ✅ Recently Completed (2024-12-28)
- Updated all tools to be free-access with premium features inside
- Removed premium locks from sidebar navigation
- Updated tools configuration with free/premium feature definitions
- Fixed authentication flow and profile sync issues
- **NEW**: Implemented comprehensive Regex Tester with multi-language support
- **NEW**: Created advanced regex engine system supporting JavaScript, Python, Java, Go
- **NEW**: Built best-in-class regex testing interface with detailed match analysis

