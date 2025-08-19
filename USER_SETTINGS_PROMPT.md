# User Settings & Profile Management System - Implementation Prompt

## 🎯 **Project Overview**

Create a basic user settings page for DevToolsKitHub where users can manage their profile, subscription, security settings, and account deletion. This system will be critical for production readiness and user trust.

## 🏗️ **Architecture & Design**

### **Page Structure**
```
/settings
├── General Tab
│   ├── Theme (System, Light or Dark)
│   ├── Timezone (UTC Default)
│   ├── Lanuage (English default)
├── Profile Tab
│   ├── Profile Picture Upload  -When clicking edit below avatar. If users changes avatar overide the supabase avatar
│   ├── Basic Information - name, email, avatar - show name, email, and avatar from supabase profile)
│   └── Email Change with Verification
│   ├── Current Plan Display - From Supabase profile
│   ├── If user is on Free plan, show Premium benefits in a  concide summary table. (Set price to $3.00 across the application)
│   ├── Upgrade/Cancel Supscription options
├── Security Tab
│   ├── Two-Factor Authentication
│   ├── Active Sessions
│   ├── Login History
│   └── Security Notifications
└── Account Tab
    ├── Account Deletion
└── Notification Settings
    ├── Notify on new releases
    ├── Notify on new blog/article posts
    
```

### **Component Architecture EXAMPLES**
```
components/settings/
├── SettingsLayout.tsx          # Main layout with tabs
├── SettingsTabs.tsx            # Vertical Tab navigation
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
  - Fetch user data and subscription status from Supabase
  - Pass data to client components
  - Error boundaries and loading states

#### **Task 2: Settings Layout Component**
- **File**: `components/settings/SettingsLayout.tsx`
- **Requirements**:
  - Tab-based navigation (General,Profile, Security, Account, Notifications)
  - Responsive design (mobile-first)
  - Popup window similair to attached image
  - Consistent styling with app theme
  - Loading states for tab switching

#### **Task 3: Tab Navigation System**
- **File**: `components/settings/SettingsTabs.tsx`
- **Requirements**:
  - Vertical tab navigation on desktop
  - Dropdown/accordion on mobile
  - Active tab highlighting
  - Tab content switching with smooth transitions
  - Keyboard navigation support

### **2. Profile Management**

#### **Task 4: General Form Component**
- **File**: `components/settings/GeneralForm.tsx`
- **Requirements**:
  - Display current user theme, timezone and language
  - Editable fields with validation
  - Real-time form validation
  - Save/cancel functionality
  - Success/error notifications
  - Loading states during save


#### **Task 5: Profile Form Component**
- **File**: `components/settings/ProfileForm.tsx`
- **Requirements**:
  - Display current user data (name, email, plan) from supabase
  - Display avatar, with a edit icon to upload/change current avatar in a new popup/modal
  - Editable fields with validation
  - Real-time form validation
  - Save/cancel functionality
  - Success/error notifications
  - Loading states during save

#### **Task 6: Avatar Upload System**
- **File**: `components/settings/AvatarUpload.tsx`
- **Requirements**:
  - Drag & drop file upload
  - Image preview and cropping
  - File type validation (JPG, PNG, WebP)
  - Size limit enforcement (5MB max)
  - Upload progress indicator
  - Error handling for failed uploads
  - Integration with Supabase Storage

### **3. Subscription Management**

#### **Task 7: Plan Display**
- **File**: `components/settings/SubscriptionCard.tsx`
- **Requirements**:
  - Current plan status with clear indicators
  - Plan details (start date, next billing, amount)
  - Billing history with downloadable invoices
  - Premium Plan benefits summary (Free vs Premium)


#### **Task 9: Subscription Actions**
- **Requirements**:
  - "Upgrade to Premium" button with Stripe integration
  - Subscription cancellation flow
  - Billing portal integration
  - Payment method management

### **4. Security Settings**

#### **Task 10: Two-Factor Authentication**
- **Requirements**:
  - Integration with existing supabase uth system

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
  - Deletion reason collection (optional)
  - Clear warning about permanent deletion


## Database Design
Design strong secure database tables to accommodate the requirements.
Design strong secure API routes for User actions


## 📚 **Documentation Requirements**

### **User Documentation**
- Settings page user guide
- FAQ section for common issues
- Security best practices
- Privacy policy updates


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



**This  settings system will provide users with full control over their account while maintaining security, privacy, and compliance standards. The implementation should follow the established patterns in DevToolsHub and integrate seamlessly with the existing architecture.**
