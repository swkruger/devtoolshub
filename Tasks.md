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

**✅ COMPLETED: JSON Formatter Implementation**
1. ✅ Install required dependencies for JSON formatter (syntax highlighter, format converters)
2. ✅ Create basic JSON formatter UI with side-by-side input/output layout
3. ✅ Implement core features: Format/Beautify, Minify, Validate with detailed errors
4. ✅ Implement JSON to XML, CSV, and YAML conversion features
5. ✅ Implement premium features: collapsible tree view, file upload/download
6. ✅ Integrate JSON formatter into the tools system with proper premium gating

**Priority 1: Core Tool Implementation**
1. ✅ Build JSON Formatter tool page with syntax highlighting (IN PROGRESS)
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

## ✅ Recently Completed (2024-12-28)
- Updated all tools to be free-access with premium features inside
- Removed premium locks from sidebar navigation
- Updated tools configuration with free/premium feature definitions
- Fixed authentication flow and profile sync issues

## ✅ Recently Completed (2025-01-07)
- **JSON Formatter Tool Implementation**: Complete implementation with all requested features
  - ✅ Installed dependencies: react-syntax-highlighter, js-yaml, xml-js, json2csv, react-json-tree
  - ✅ Created side-by-side input/output layout with responsive design
  - ✅ Implemented core features: Format/Beautify, Minify/Compact, Detailed validation with error messages and suggestions
  - ✅ Added conversion features: JSON to XML, CSV, and YAML with proper error handling
  - ✅ Implemented premium features: Interactive collapsible tree view, file upload/download capabilities
  - ✅ Added proper premium gating with upgrade prompts for non-premium users
  - ✅ Created modern UI with syntax highlighting, copy-to-clipboard, and file operations
  - ✅ Added comprehensive error handling with line/column numbers and helpful suggestions
  - ✅ **Enhanced Error Highlighting**: Auto-formats JSON in highlighted mode for precise line-by-line error highlighting (Premium)
  - ✅ **Editable Enhanced Mode**: Premium users can edit directly in syntax-highlighted editor with auto-completion and real-time error detection
  - ✅ **Accurate Error Highlighting**: Fixed line number mapping between original and formatted JSON for precise error highlighting

