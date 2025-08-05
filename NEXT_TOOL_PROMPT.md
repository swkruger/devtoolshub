# 🛠 Next Tool Development Prompt

## 🎯 Goal: Implement Timestamp Converter Tool

Continue building the best developer tools platform by implementing the **Timestamp Converter** tool, following the exact same approach as our previous 6 successful tools.

---

## 📋 Context & Requirements

### ✅ Current Status:
- **JSON Formatter** ✅ Complete - Advanced JSON processing with validation and formatting
- **Regex Tester** ✅ Complete - Multi-language regex testing with visualization and highlighting
- **JWT Decoder/Encoder** ✅ Complete - Comprehensive JWT processing with bulk operations
- **Image Compressor** ✅ Complete - Advanced image processing with format conversion
- **UUID Generator** ✅ Complete - Multi-version UUID generation with namespace management
- **XPath/CSS Selector Tester** ✅ Complete - Real-time element highlighting and testing

### 🎯 Next Tool: **⏰ Timestamp Converter**
**Path**: `/tools/timestamp-converter`
**Purpose**: Convert between Unix timestamps, human-readable dates, and various time formats with timezone support

---

## 🏗 Technical Architecture Requirements

### 📁 Required Structure:
```
app/tools/timestamp-converter/
├── page.tsx                    # Main page component
├── tool.config.ts             # Tool configuration
└── components/
    ├── timestamp-converter-client.tsx  # Main client component
    ├── help-panel.tsx                 # Documentation and examples
    ├── timezone-selector.tsx          # Timezone selection component
    ├── format-selector.tsx            # Date format selection
    └── batch-converter.tsx            # Premium bulk conversion
```

### 🔄 Implementation Steps:

#### 1. **Update Configuration** (lib/tools.ts)
```typescript
{
  id: 'timestamp-converter',
  name: 'Timestamp Converter',
  description: 'Convert between Unix timestamps and human-readable dates with timezone support',
  icon: '⏰',
  path: '/tools/timestamp-converter',
  category: 'conversion',
  tags: ['timestamp', 'unix', 'date', 'time', 'timezone', 'epoch', 'conversion'],
  free: [
    'Unix timestamp to date conversion',
    'Date to Unix timestamp conversion', 
    'Current timestamp display',
    'Basic timezone support',
    'ISO 8601 format support',
    'Millisecond precision',
    'Copy results to clipboard'
  ],
  premium: [
    'Batch timestamp conversion',
    'Custom date format patterns',
    'Timezone comparison view',
    'Historical timezone data',
    'CSV import/export',
    'Timestamp arithmetic',
    'Relative time calculations',
    'Multiple timestamp formats'
  ]
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

#### 4. **Core Client Component** (timestamp-converter-client.tsx)
```typescript
// Key Features & State Management:
interface TimestampConverterState {
  // Input/Output
  unixTimestamp: string;
  humanDate: string;
  selectedTimezone: string;
  selectedFormat: string;
  
  // Display
  currentTimestamp: number;
  conversionResults: ConversionResult[];
  isAutoUpdate: boolean;
  
  // Premium features
  batchMode: boolean;
  batchInput: string;
  customFormat: string;
  timezoneComparison: string[];
  
  // UI states
  activeTab: 'single' | 'batch' | 'current';
  isLoading: boolean;
  copyStatus: string;
}

// Core Functions:
- convertUnixToDate(timestamp: number, timezone: string, format: string)
- convertDateToUnix(dateString: string, timezone: string)
- getCurrentTimestamp()
- updateCurrentTime() // Auto-updating current time
- handleBatchConversion() // Premium
- calculateTimeDifference() // Premium
- exportResults() // Premium
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
│ Tabs: [Single] [Batch] [Current Time]   │
├─────────────────────────────────────────┤
│ Input Section:                          │
│ ┌─────────────────┬─────────────────┐   │
│ │ Unix Timestamp  │ Human Date      │   │
│ │ [input field]   │ [input field]   │   │
│ └─────────────────┴─────────────────┘   │
├─────────────────────────────────────────┤
│ Configuration:                          │
│ [Timezone Selector] [Format Selector]   │
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

### 📅 Timestamp Formats to Support:
```typescript
// Input/Output Formats:
- Unix timestamp (seconds since epoch)
- Unix timestamp with milliseconds
- ISO 8601 format (2024-12-29T15:30:00Z)
- RFC 2822 format
- Local date string
- Custom format patterns (premium)

// Timezone Support:
- UTC (default)
- Local browser timezone
- Major world timezones (America/New_York, Europe/London, etc.)
- Timezone abbreviations (EST, PST, GMT, etc.)
- Custom timezone offset (+05:30, -08:00)
```

### 🔧 Validation & Error Handling:
```typescript
// Input Validation:
- Validate Unix timestamp range (reasonable dates)
- Check date string format compatibility
- Verify timezone validity
- Handle daylight saving time transitions
- Prevent future timestamp overflow

// Error Messages:
- "Invalid timestamp format"
- "Timestamp out of reasonable range" 
- "Invalid date string"
- "Timezone not recognized"
- "Date does not exist (Feb 30th, etc.)"
```

### ⚡ Performance Considerations:
- **Debounced Input**: 300ms delay for auto-conversion
- **Timezone Caching**: Cache timezone data for performance
- **Format Caching**: Cache compiled format patterns
- **Memory Management**: Clean up intervals for current time
- **Batch Processing**: Handle large datasets efficiently (premium)

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
// Basic Conversion Tests:
✓ Convert valid Unix timestamp to date
✓ Convert valid date string to Unix timestamp
✓ Handle timestamp with milliseconds
✓ Convert between different timezones
✓ Validate current timestamp display

// Edge Cases:
✓ Handle epoch timestamp (0)
✓ Handle negative timestamps
✓ Handle leap years and leap seconds
✓ Handle daylight saving time transitions
✓ Handle invalid input gracefully

// Premium Features:
✓ Batch conversion with mixed formats
✓ Custom format pattern validation
✓ Timezone comparison accuracy
✓ Export functionality
✓ Timestamp arithmetic operations
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