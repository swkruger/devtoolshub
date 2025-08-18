# User Settings & Profile Management System - Implementation Prompt

## 🎯 **Project Overview**

Create a comprehensive user settings page for DevToolsHub where users can manage their profile, subscription, security settings, and account deletion. This system will be critical for production readiness and user trust.

## 🏗️ **Architecture & Design**

### **Page Structure**
```
/settings
├── Profile Tab
│   ├── Basic Information (name, email, avatar)
│   ├── Profile Picture Upload
│   ├── Bio & Preferences
│   └── Email Change with Verification
├── Subscription Tab
│   ├── Current Plan Display
│   ├── Plan Comparison Table
│   ├── Upgrade/Downgrade Options
│   ├── Billing History
│   └── Usage Analytics
├── Security Tab
│   ├── Password Change
│   ├── Two-Factor Authentication
│   ├── Active Sessions
│   ├── Login History
│   └── Security Notifications
└── Account Tab
    ├── Data Export
    ├── Account Deletion
    ├── Deletion Recovery
    └── Privacy Settings
```

### **Component Architecture**
```
components/settings/
├── SettingsLayout.tsx          # Main layout with tabs
├── SettingsTabs.tsx            # Tab navigation
├── ProfileForm.tsx             # Profile editing form
├── SubscriptionCard.tsx        # Subscription management
├── SecuritySettings.tsx        # Security options
├── AccountDeletion.tsx         # Account deletion flow
├── AvatarUpload.tsx            # Profile picture upload
├── PlanComparison.tsx          # Free vs Premium comparison
├── SessionManager.tsx          # Active sessions display
└── DataExport.tsx              # Data export functionality
```

## 📋 **Detailed Implementation Requirements**

### **1. Core Infrastructure**

#### **Task 1: Settings Page Structure**
- **File**: `app/settings/page.tsx`
- **Requirements**:
  - Server component with auth protection
  - Fetch user data and subscription status
  - Pass data to client components
  - Proper metadata and SEO
  - Error boundaries and loading states

#### **Task 2: Settings Layout Component**
- **File**: `components/settings/SettingsLayout.tsx`
- **Requirements**:
  - Tab-based navigation (Profile, Subscription, Security, Account)
  - Responsive design (mobile-first)
  - Breadcrumb navigation back to dashboard
  - Consistent styling with app theme
  - Loading states for tab switching

#### **Task 3: Tab Navigation System**
- **File**: `components/settings/SettingsTabs.tsx`
- **Requirements**:
  - Horizontal tab navigation on desktop
  - Dropdown/accordion on mobile
  - Active tab highlighting
  - Tab content switching with smooth transitions
  - Keyboard navigation support

### **2. Profile Management**

#### **Task 4: Profile Form Component**
- **File**: `components/settings/ProfileForm.tsx`
- **Requirements**:
  - Display current user data (name, email, plan)
  - Editable fields with validation
  - Real-time form validation
  - Save/cancel functionality
  - Success/error notifications
  - Loading states during save

#### **Task 5: Avatar Upload System**
- **File**: `components/settings/AvatarUpload.tsx`
- **Requirements**:
  - Drag & drop file upload
  - Image preview and cropping
  - File type validation (JPG, PNG, WebP)
  - Size limit enforcement (5MB max)
  - Upload progress indicator
  - Error handling for failed uploads
  - Integration with Supabase Storage

#### **Task 6: Profile Preferences**
- **Requirements**:
  - Timezone selection (dropdown with search)
  - Theme preference (light/dark mode)
  - Email notification settings
  - Language/locale selection
  - Developer preferences (default tool, keyboard shortcuts)

### **3. Subscription Management**

#### **Task 7: Subscription Display**
- **File**: `components/settings/SubscriptionCard.tsx`
- **Requirements**:
  - Current plan status with clear indicators
  - Plan details (start date, next billing, amount)
  - Usage statistics and limits
  - Billing history with downloadable invoices
  - Plan comparison table (Free vs Premium)

#### **Task 8: Plan Comparison Table**
- **File**: `components/settings/PlanComparison.tsx`
- **Requirements**:
  - Feature comparison matrix
  - Current plan highlighting
  - Upgrade/downgrade CTAs
  - Pricing information
  - Feature descriptions with tooltips

#### **Task 9: Subscription Actions**
- **Requirements**:
  - "Upgrade to Premium" button with Stripe integration
  - Subscription cancellation flow
  - Plan change options (monthly/yearly)
  - Billing portal integration
  - Payment method management

### **4. Security Settings**

#### **Task 10: Password Management**
- **File**: `components/settings/SecuritySettings.tsx`
- **Requirements**:
  - Password change form with strength validation
  - Current password confirmation
  - Password strength indicator
  - Password requirements display
  - Success confirmation with email notification

#### **Task 11: Two-Factor Authentication**
- **Requirements**:
  - 2FA setup flow with QR code
  - Backup codes generation
  - 2FA disable with confirmation
  - Recovery options
  - Integration with existing auth system

#### **Task 12: Session Management**
- **File**: `components/settings/SessionManager.tsx`
- **Requirements**:
  - Display active sessions and devices
  - Device information (browser, OS, location)
  - Session activity timestamps
  - Revoke session functionality
  - Login history with IP addresses

### **5. Account Deletion**

#### **Task 13: Account Deletion Interface**
- **File**: `components/settings/AccountDeletion.tsx`
- **Requirements**:
  - Multi-step deletion confirmation
  - Data export option before deletion
  - Deletion reason collection (optional)
  - Final password confirmation
  - Clear warning about permanent deletion

#### **Task 14: Data Export Functionality**
- **File**: `components/settings/DataExport.tsx`
- **Requirements**:
  - Export user data in JSON format
  - Include profile, preferences, tool data
  - Download functionality
  - Export progress indicator
  - GDPR compliance for data portability

#### **Task 15: Deletion Safety Measures**
- **Requirements**:
  - 30-day grace period for account recovery
  - Email notifications during deletion process
  - Account recovery during grace period
  - Permanent deletion after grace period
  - Audit trail for compliance

### **6. Database Schema Updates**

#### **Task 16: User Preferences Table**
```sql
-- Migration: db/migrations/XXX_create_user_preferences.sql
CREATE TABLE public.user_preferences (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    timezone text DEFAULT 'UTC',
    theme text DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    language text DEFAULT 'en',
    email_notifications jsonb DEFAULT '{}',
    developer_preferences jsonb DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE UNIQUE INDEX idx_user_preferences_user_id_unique ON public.user_preferences(user_id);

-- RLS Policies
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences" ON public.user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON public.user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON public.user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);
```

#### **Task 17: Account Deletion Table**
```sql
-- Migration: db/migrations/XXX_create_account_deletions.sql
CREATE TABLE public.account_deletions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    deletion_requested_at timestamptz NOT NULL DEFAULT now(),
    deletion_scheduled_at timestamptz NOT NULL,
    deletion_reason text,
    data_exported boolean DEFAULT false,
    recovery_token text,
    is_cancelled boolean DEFAULT false,
    cancelled_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_account_deletions_user_id ON public.account_deletions(user_id);
CREATE INDEX idx_account_deletions_scheduled_at ON public.account_deletions(deletion_scheduled_at);

-- RLS Policies
ALTER TABLE public.account_deletions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own deletion requests" ON public.account_deletions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own deletion requests" ON public.account_deletions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own deletion requests" ON public.account_deletions
    FOR UPDATE USING (auth.uid() = user_id);
```

### **7. API Routes & Server Actions**

#### **Task 18: Profile Management API**
- **Route**: `/api/settings/profile`
- **Methods**: GET, PUT
- **Requirements**:
  - Fetch user profile data
  - Update profile information
  - Handle avatar upload
  - Email change with verification
  - Validation and error handling

#### **Task 19: Subscription Management API**
- **Route**: `/api/settings/subscription`
- **Methods**: GET, POST
- **Requirements**:
  - Fetch subscription status
  - Handle plan upgrades/downgrades
  - Cancel subscription
  - Get billing history
  - Stripe integration

#### **Task 20: Security Settings API**
- **Route**: `/api/settings/security`
- **Methods**: POST
- **Requirements**:
  - Password change
  - 2FA setup/disable
  - Session management
  - Security notifications

#### **Task 21: Account Deletion API**
- **Route**: `/api/settings/account-deletion`
- **Methods**: POST, DELETE
- **Requirements**:
  - Initiate account deletion
  - Cancel deletion request
  - Export user data
  - Permanent deletion after grace period

### **8. UI/UX Requirements**

#### **Task 22: Design Consistency**
- **Requirements**:
  - Match existing app design language
  - Use ShadCN components consistently
  - Follow established spacing and typography
  - Implement dark/light mode support
  - Responsive design for all screen sizes

#### **Task 23: Form Validation**
- **Requirements**:
  - Real-time validation with helpful messages
  - Client-side validation for immediate feedback
  - Server-side validation for security
  - Error state styling
  - Success state indicators

#### **Task 24: Loading States**
- **Requirements**:
  - Skeleton loading for initial page load
  - Button loading states for actions
  - Progress indicators for file uploads
  - Disabled states during operations
  - Smooth transitions between states

### **9. Accessibility Requirements**

#### **Task 25: Keyboard Navigation**
- **Requirements**:
  - Full keyboard navigation support
  - Tab order logical and intuitive
  - Escape key to close modals
  - Enter key for form submission
  - Arrow keys for tab navigation

#### **Task 26: Screen Reader Support**
- **Requirements**:
  - ARIA labels for all interactive elements
  - Proper heading hierarchy
  - Live regions for dynamic content
  - Focus management for modals
  - Descriptive error messages

#### **Task 27: WCAG 2.1 AA Compliance**
- **Requirements**:
  - Color contrast ratios meet standards
  - Text resizing support
  - Alternative text for images
  - Skip links for navigation
  - Error identification and recovery

### **10. Security Requirements**

#### **Task 28: Data Protection**
- **Requirements**:
  - CSRF protection on all forms
  - Rate limiting for sensitive operations
  - Input sanitization and validation
  - Secure file upload handling
  - Audit logging for all actions

#### **Task 29: Authentication Security**
- **Requirements**:
  - Session management
  - Password strength requirements
  - Account lockout protection
  - Suspicious activity detection
  - Secure password reset flow

### **11. Testing Requirements**

#### **Task 30: Unit Testing**
- **Requirements**:
  - Test all form validation logic
  - Test API route handlers
  - Test database operations
  - Test error handling scenarios
  - Test accessibility features

#### **Task 31: Integration Testing**
- **Requirements**:
  - Test complete user flows
  - Test Stripe integration
  - Test file upload functionality
  - Test email notifications
  - Test account deletion process

#### **Task 32: User Testing**
- **Requirements**:
  - Test on multiple devices and browsers
  - Test with screen readers
  - Test keyboard-only navigation
  - Test error scenarios
  - Test performance under load

## 🎯 **Implementation Phases**

### **Phase 1: Foundation (Week 1)**
- Tasks 1-3: Basic page structure and navigation
- Tasks 16-17: Database schema setup
- Tasks 18-21: Basic API routes

### **Phase 2: Core Features (Week 2)**
- Tasks 4-6: Profile management
- Tasks 7-9: Subscription display
- Tasks 22-24: Basic UI/UX

### **Phase 3: Advanced Features (Week 3)**
- Tasks 10-12: Security settings
- Tasks 13-15: Account deletion
- Tasks 25-27: Accessibility

### **Phase 4: Polish & Testing (Week 4)**
- Tasks 28-29: Security review
- Tasks 30-32: Comprehensive testing
- Documentation and deployment

## 🔒 **Security Considerations**

### **Data Privacy**
- Implement GDPR-compliant data export
- Add data retention policies
- Ensure secure data deletion
- Add audit trails for compliance

### **Authentication Security**
- Implement proper session management
- Add rate limiting for sensitive operations
- Use secure password requirements
- Add account lockout protection

### **File Upload Security**
- Validate file types and sizes
- Scan uploaded files for malware
- Store files securely in Supabase Storage
- Implement proper access controls

## 📱 **Mobile Considerations**

### **Responsive Design**
- Mobile-first approach
- Touch-friendly controls
- Optimized form layouts
- Simplified navigation on small screens

### **Performance**
- Lazy load non-critical components
- Optimize image uploads for mobile
- Minimize bundle size
- Implement proper caching

## 🚀 **Deployment Checklist**

### **Pre-deployment**
- [ ] All tests passing
- [ ] Security review completed
- [ ] Accessibility audit passed
- [ ] Performance testing completed
- [ ] Documentation updated

### **Post-deployment**
- [ ] Monitor error rates
- [ ] Track user engagement
- [ ] Monitor performance metrics
- [ ] Gather user feedback
- [ ] Plan iterative improvements

## 📚 **Documentation Requirements**

### **User Documentation**
- Settings page user guide
- FAQ section for common issues
- Security best practices
- Privacy policy updates

### **Developer Documentation**
- API documentation
- Database schema documentation
- Component usage guidelines
- Security implementation notes

## 🎯 **Success Metrics**

### **User Experience**
- Settings page load time < 2 seconds
- Form submission success rate > 95%
- Mobile usability score > 90%
- Accessibility compliance 100%

### **Security**
- Zero security vulnerabilities
- All sensitive operations properly protected
- Audit logging for all user actions
- GDPR compliance verified

### **Performance**
- Page load time < 2 seconds
- API response time < 500ms
- File upload success rate > 98%
- Error rate < 1%

---

**This comprehensive settings system will provide users with full control over their account while maintaining security, privacy, and compliance standards. The implementation should follow the established patterns in DevToolsHub and integrate seamlessly with the existing architecture.**
