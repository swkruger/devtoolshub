# 🛠 Next Tool Development Prompt

## 🎯 Goal: Implement PWA Assets & Manifest Generator

Build a professional tool that generates all required PWA images and filenames according to current platform specs, plus a ready-to-use `manifest.json` and `<link>` tags. Follow the same architecture, premium gating, and UI conventions as existing tools.

---

## 📋 Context & Requirements

### ✅ Current Status:
- **JSON Formatter** ✅ Complete - Advanced JSON processing with validation and formatting
- **Regex Tester** ✅ Complete - Multi-language regex testing with visualization and highlighting
- **JWT Decoder/Encoder** ✅ Complete - Comprehensive JWT processing with bulk operations
- **Image Compressor** ✅ Complete - Advanced image processing with format conversion
- **UUID Generator** ✅ Complete - Multi-version UUID generation with namespace management
- **XPath/CSS Selector Tester** ✅ Complete - Real-time element highlighting and testing

### 🎯 Next Tool: **PWA Assets & Manifest Generator**
**Path**: `/tools/pwa-assets`
**Purpose**: Generate PWA icons, favicons, maskable icons, iOS/Android assets, and output a correct manifest.json + HTML tags

---

## 🏗 Technical Architecture Requirements

### 📁 Required Structure:
```
app/tools/pwa-assets/
├── page.tsx                        # Server page (auth + header + premium overview)
├── tool.config.ts                 # Tool config mirrors lib/tools.ts
└── components/
    ├── pwa-assets-client.tsx      # Main client UI
    ├── preview-grid.tsx           # Thumbnails of generated assets
    ├── export-panel.tsx           # Manifest/tags preview + ZIP
    └── help-panel.tsx             # Docs/spec tables/tips
└── lib/
    ├── presets.ts                 # Size matrices and filenames
    ├── pipeline.ts                # Canvas rasterization helpers
    ├── naming.ts                  # Filename builders
    └── zip.ts                     # ZIP assembly (JSZip)
```

### 🔄 Implementation Steps:

#### 1. **Update Configuration** (lib/tools.ts)
```typescript
{
  id: 'pwa-assets',
  name: 'PWA Assets & Manifest Generator',
  description: 'Generate PWA icons, favicons, maskable icons, iOS/Android assets, manifest.json, and HTML tags',
  icon: Globe, // or appropriate icon
  path: '/tools/pwa-assets',
  category: 'web',
  tags: ['pwa','icons','manifest','favicon','maskable','ios','android'],
  features: {
    free: [
      'Standard manifest icons (48..512)',
      'Favicons (16/32/48)',
      'Apple touch 180x180',
      'Optional maskable 192/512',
      'Manifest.json + basic link tags',
      'ZIP export'
    ],
    premium: [
      'Full iOS/Android matrices',
      'Splash screens (light/dark)',
      'Windows tiles & Safari pinned tab',
      'Light/Dark variants with themed manifest',
      'Batch brand mode'
    ]
  }
}
```

#### 2. **Create Tool Configuration** (tool.config.ts)
- Mirror the structure from lib/tools.ts
- Include metadata for SEO and documentation

#### 3. **Main Page Component** (page.tsx)
```typescript
// Key Requirements:
- Async server component for auth check
- Compact header with tool icon and description
- Conditional premium features overview (only for free users)
- Pass isPremiumUser and userId to client component
- Proper metadata for SEO
```

#### 4. **Core Client Component** (pwa-assets-client.tsx)
```typescript
// Key Features & State Management:
interface PwaAssetState {
  sourceFile?: File;
  backgroundColor: string; // HEX
  paddingPercent: number; // 0-30
  cornerRadiusPercent: number; // 0-50
  maskable: boolean;
  quality: number; // 0.6..1
  themeColor: string;
  manifestBackground: string;
  preset: 'minimal' | 'recommended' | 'full';
  // Output
  files: Array<{ path: string; blob: Blob; width: number; height: number }>;
  manifest: string; // JSON string
  headSnippet: string; // HTML tags
  // UI
  activeTab: 'configure' | 'preview' | 'export' | 'help';
  isProcessing: boolean;
}

// Core Functions:
- rasterizeAll()
- buildManifest()
- buildHeadSnippet()
- makeZip()
- switchPreset()
- (premium) generateSplashScreens()
```

#### 5. **Premium Features Implementation**
```typescript
// Free Tier:
✓ Basic timestamp conversion (Unix ↔ Date)
✓ Current timestamp display with auto-update
✓ Basic timezone selection (UTC, Local, common zones)
✓ Standard formats (ISO 8601, locale string, etc.)
✓ Copy to clipboard functionality
✓ Input validation and error handling

// Premium Tier (with crown icons for free users):
👑 Batch conversion from CSV/text input
👑 Custom date format patterns (strftime, moment.js styles)
👑 Timezone comparison view (multiple zones simultaneously)
👑 Timestamp arithmetic (add/subtract time)
👑 Relative time calculations ("2 hours ago", "in 3 days")
👑 Export results to CSV/JSON
👑 Historical timezone data and DST handling
👑 Multiple input formats (various timestamp formats)
```

---

## 🎨 UI/UX Design Requirements

### 📱 Layout Pattern (match existing tools):
```
┌─────────────────────────────────────────┐
│ Header: Icon + Title + Description      │
├─────────────────────────────────────────┤
│ Premium Features Overview (free users)  │
├─────────────────────────────────────────┤
│ Action Toolbar: [Convert] [Clear] [?]   │
├─────────────────────────────────────────┤
│ Tabs: [Configure] [Preview] [Export] [Help] │
├─────────────────────────────────────────┤
│ Input Section:                          │
│ ┌─────────────────┬─────────────────┐   │
│ │ Unix Timestamp  │ Human Date      │   │
│ │ [input field]   │ [input field]   │   │
│ └─────────────────┴─────────────────┘   │
├─────────────────────────────────────────┤
│ Configuration:                          │
│ [Upload] [Padding/Radius/Maskable] [Theme/Background] │
├─────────────────────────────────────────┤
│ Results Section:                        │
│ [Conversion Results with Copy buttons]  │
└─────────────────────────────────────────┘
```

### 🎨 Component Styling:
- **Input Fields**: Match JSON Formatter editor style with proper labels
- **Timezone Selector**: Searchable dropdown with common zones at top
- **Format Selector**: Dropdown with preview of selected format
- **Results Display**: Cards with copy buttons and proper spacing
- **Current Time**: Live updating display with multiple formats
- **Batch Mode**: Textarea input with results table (premium)

### 🔄 Interactive Features:
- **Live Conversion**: Auto-convert as user types (debounced)
- **Bidirectional**: Changes in either field update the other
- **Current Time**: Auto-updating every second with pause/play control
- **Format Preview**: Show example of selected date format
- **Validation**: Real-time validation with error messages
- **Copy Feedback**: Toast notifications for successful copies

---

## 🧠 Core Functionality Specifications

### 📐 Sizes & Filenames
Free:
- Manifest icons: 48, 72, 96, 144, 192, 256, 384, 512 → `icon-<WxH>.png`
- Favicons: 16, 32, 48 → `favicon-<WxH>.png` (+ optional `.ico`)
- Apple touch: 180 → `apple-touch-icon-180x180.png`
- Maskable (optional): 192/512 → `maskable_icon-<WxH>.png` with `purpose: "maskable"`

Premium:
- iOS icons: 120, 152, 167, 180
- Android maskable set: 192, 256, 384, 512
- Windows tiles: 150, 310x150, 310
- Safari pinned tab: monochrome SVG
- Splash screens (portrait/landscape common sizes) with background color

### 🔧 Validation & Error Handling:
```typescript
// Input Validation:
- Validate image type (PNG/SVG) and file size limits
- Guard against massive dimensions; cap output to 1024/2048 px
- Ensure exact output WxH per preset
- Validate HEX colors and quality ranges

// Error Messages:
- "Invalid timestamp format"
- "Timestamp out of reasonable range" 
- "Invalid date string"
- "Timezone not recognized"
- "Date does not exist (Feb 30th, etc.)"
```

### ⚡ Performance Considerations:
- **Debounced Input**: 300ms delay for auto-conversion
- **OffscreenCanvas/createImageBitmap** where supported
- **Web Worker** for splash/batch (premium)
- **Memory Management**: dispose ImageBitmaps, reuse canvases
- **ZIP streaming** if needed

---

## ♿ Accessibility Requirements

### ⌨️ Keyboard Navigation:
```typescript
// Keyboard Shortcuts:
- F1: Open help panel
- Ctrl/Cmd + C: Copy current result
- Ctrl/Cmd + V: Paste and convert timestamp
- Tab: Navigate between input fields
- Enter: Trigger conversion
- Escape: Clear all fields
- Ctrl/Cmd + Shift + C: Copy all results (premium)
```

### 🔍 Screen Reader Support:
- Proper ARIA labels for all inputs
- Live regions for conversion results
- Descriptive button text
- Error message announcements
- Status updates for copy operations

### 🎯 Focus Management:
- Clear focus indicators
- Logical tab order
- Skip links for complex layouts
- Focus trapping in modals

---

## 🧪 Testing Requirements

### ✅ Core Test Cases:
```typescript
// Basic Asset Tests:
✓ Every generated image has exact WxH and PNG format
✓ Manifest icons array contains all free sizes with correct filenames
✓ Maskable icons include purpose: 'maskable'
✓ Head snippet contains correct link/meta tags

// Edge Cases:
✓ Handle epoch timestamp (0)
✓ Handle negative timestamps
✓ Handle leap years and leap seconds
✓ Handle daylight saving time transitions
✓ Handle invalid input gracefully

// Premium Features:
✓ iOS/Android matrices created with exact sizes
✓ Splash screens generated with correct canvas size and bg color
✓ Windows tiles and pinned tab assets
✓ ZIP contains all premium assets and manifest variants
```

### 🐛 Error Scenarios:
- Invalid timestamp formats
- Out-of-range timestamps
- Malformed date strings
- Non-existent dates
- Timezone parsing errors
- Network issues (for timezone data)

---

## 📚 Documentation Requirements

### 📖 Help Panel Content:
```markdown
## Examples:
- Unix Timestamp: 1704110400 → 2024-01-01 12:00:00 UTC
- With Milliseconds: 1704110400000 → 2024-01-01 12:00:00.000 UTC
- ISO Format: 2024-01-01T12:00:00Z → 1704110400
- Local Date: 1/1/2024, 12:00:00 PM → 1704110400 (depends on timezone)

## Keyboard Shortcuts:
- F1: Toggle this help panel
- Ctrl+C: Copy current result
- Ctrl+V: Paste and convert
- Enter: Convert timestamp
- Escape: Clear all fields

## Timezone Support:
- Use standard timezone names (America/New_York)
- UTC is the default and most reliable
- Local timezone detected automatically
- Premium: Historical timezone data with DST

## Format Patterns (Premium):
- YYYY-MM-DD HH:mm:ss
- MM/DD/YYYY h:mm A
- DD.MM.YYYY HH:mm
- Custom strftime patterns supported
```

### 🏷️ Common Use Cases:
- Converting API timestamps to readable dates
- Converting log timestamps for debugging
- Scheduling events across timezones
- Database timestamp conversion
- Analyzing historical data with timestamps

---

## 🔒 Security & Privacy

### 🛡️ Security Considerations:
- **Input Sanitization**: Validate all timestamp inputs
- **XSS Prevention**: Escape user input in displays
- **DoS Protection**: Limit batch processing size
- **Rate Limiting**: Prevent abuse of conversion API
- **Data Privacy**: No timestamp data stored server-side

### 🔐 Premium Feature Security:
- Validate file uploads for batch conversion
- Limit export file sizes
- Sanitize custom format patterns
- Prevent timezone data injection attacks

---

## 🚀 Success Criteria

The Timestamp Converter should be:

### ✅ **Compilation Ready**
- Builds without TypeScript errors
- No linting violations
- All imports resolve correctly
- Production build succeeds

### ✅ **Feature Complete**
- All free features working perfectly
- Premium features implemented with proper gating
- Comprehensive timezone support
- Multiple format conversion support

### ✅ **Consistent Design**
- Matches existing tool styling exactly
- Follows established UI patterns
- Consistent spacing and typography
- Proper responsive behavior

### ✅ **Accessible & Usable**
- Full keyboard navigation support
- Screen reader compatibility
- Clear error messages and feedback
- Intuitive user interface

### ✅ **Well Documented**
- Updated lib/tools.ts configuration
- Tasks.md implementation tracking
- README.md status update
- Comprehensive help panel

---

## 🎯 Implementation Priority

### Phase 1: Core Functionality
1. Update lib/tools.ts with Timestamp Converter configuration
2. Create basic page and client components
3. Implement Unix ↔ Date conversion
4. Add timezone selection and basic formats
5. Current timestamp display with auto-update

### Phase 2: Enhanced Features  
6. Input validation and error handling
7. Copy to clipboard functionality
8. Bidirectional live conversion
9. Help panel with examples and shortcuts
10. Mobile responsive design

### Phase 3: Premium Features
11. Batch conversion interface (disabled for free users)
12. Custom format patterns (premium)
13. Timezone comparison view (premium)
14. Export functionality (premium)
15. Timestamp arithmetic (premium)

### Phase 4: Polish & Testing
16. Accessibility improvements
17. Performance optimization
18. Edge case handling
19. Documentation updates
20. Final testing and validation

---

## 🔧 Technical Implementation Notes

### 📦 Required Dependencies:
```json
// Likely needed packages (check if already installed):
"date-fns": "^2.30.0",          // Date manipulation
"date-fns-tz": "^2.0.0",        // Timezone support
```

### 🎨 Styling Consistency:
- Use existing Tailwind classes from other tools
- Match button styles from UUID Generator
- Use same color scheme as Regex Tester for highlights
- Follow JSON Formatter input field styling
- Consistent spacing with Image Compressor layout

### 🔄 State Management Pattern:
```typescript
// Follow established pattern from other tools:
- Use useState for local component state
- Use useCallback for event handlers
- Use useEffect for side effects (auto-update timer)
- Use custom hooks for reusable logic (useDebounce, etc.)
- Props drilling for isPremiumUser from server component
```

---

## 🎯 Start Implementation

**Choose this tool and implement it following this exact pattern. The goal is to maintain the high quality and consistency established by our previous 6 tools while adding comprehensive timestamp conversion capabilities.**

Begin with updating `lib/tools.ts` and follow the established directory structure. Ensure the tool integrates seamlessly with our existing platform architecture.

**Remember**: 
- ✅ Follow exact same patterns as previous tools
- ✅ Premium features disabled with crown for free users
- ✅ Use project's custom toast system (not sonner)
- ✅ Match editor styling from JSON Formatter
- ✅ Implement proper accessibility and keyboard shortcuts
- ✅ Update Tasks.md with implementation progress
- ✅ Test compilation at each major step

**Success = Another professional-grade tool that rivals the best timestamp converters available online! 🚀**