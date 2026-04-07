# Authentication System Analysis & Recommendations

## Current State

### ✅ What's Currently in Place

#### 1. **Basic User Authentication**

- **Location**: `src/app/lib/auth.ts`, `src/app/contexts/AuthContext.tsx`
- **Features**:
  - Email/password signup and login
  - Google OAuth support
  - Password reset functionality
  - Email verification flow
  - Session management via Supabase Auth
  - Auto-profile creation on signup (database trigger)

#### 2. **User Profiles**

- **Location**: `src/app/lib/setup-database.sql`
- **Schema**: `profiles` table with:
  - User metadata (username, display_name, avatar_url)
  - Onboarding tracking (onboarding_step, onboarding_complete)
  - User interests, subcategories, dealbreakers
  - Reviewer stats (reviews_count, badges_count, is_top_reviewer)

#### 3. **Route Protection**

- **Location**: `src/middleware.ts`
- **Features**:
  - Protected routes require authentication + email verification
  - Redirects unauthenticated users to `/onboarding`
  - Redirects unverified users to `/verify-email`
  - Auth routes redirect authenticated users away

#### 4. **Business Schema**

- **Location**: `src/app/lib/schema/businesses.sql`
- **Features**:
  - `businesses` table with `owner_id` field (references `auth.users`)
  - RLS policies:
    - Public can read active businesses
    - Authenticated users can insert businesses
    - **Owners can update their businesses** (using `auth.uid() = owner_id`)

#### 5. **Business Pages (UI Only)**

- **Location**:
  - `src/app/business/login/page.tsx` - Business login page
  - `src/app/manage-business/page.tsx` - Business management dashboard
  - `src/app/claim-business/page.tsx` - Business claiming page
- **Status**: UI exists but uses regular authentication (no business-specific auth)

---

## ❌ What's Missing

### 1. **Role-Based Access Control (RBAC)**

**Current State**: No role system exists

- No user roles (admin, business_owner, regular_user)
- No role assignment in database
- No role-based permissions

**What's Needed**:

- Add `role` field to `profiles` table (or separate `user_roles` table)
- Define roles: `user`, `business_owner`, `admin`
- Create role-based permission checks

### 2. **Business Owner Authentication**

**Current State**: Business login uses regular auth

- `business/login` page uses `useAuth().login()` (same as regular users)
- No distinction between business owners and regular users
- No business owner verification process

**What's Needed**:

- Separate business owner authentication flow
- Business owner verification/claiming process
- Business owner dashboard access control

### 3. **Business Ownership Verification**

**Current State**: `owner_id` exists but no verification

- Businesses have `owner_id` field
- No verification that user actually owns the business
- No claiming/verification workflow

**What's Needed**:

- Business claiming workflow
- Ownership verification (email, documents, etc.)
- Pending/verified status for business ownership

### 4. **Permission System**

**Current State**: Basic RLS only

- RLS policies check `auth.uid() = owner_id` for updates
- No granular permissions (read, write, delete, manage)
- No permission checks in application code

**What's Needed**:

- Permission definitions (e.g., `business:read`, `business:write`, `business:delete`)
- Permission checking utilities
- Role-permission mapping

### 5. **Business-Specific Route Protection**

**Current State**: No business-specific protection

- Business management pages (`/manage-business`, `/business/[id]/edit`) not protected
- No check if user owns the business before allowing edits

**What's Needed**:

- Middleware/guards for business owner routes
- Check business ownership before allowing access
- Redirect non-owners appropriately

### 6. **Admin Role & Privileges**

**Current State**: No admin system

- No admin users
- No admin dashboard
- No admin privileges (moderate reviews, manage businesses, etc.)

**What's Needed**:

- Admin role definition
- Admin authentication/authorization
- Admin dashboard and tools

---

## 🔧 What Needs to Be Changed

### 1. **Database Schema Changes**

#### Add Role System

```sql
-- Option 1: Add role to profiles table
ALTER TABLE profiles
ADD COLUMN role TEXT DEFAULT 'user'
CHECK (role IN ('user', 'business_owner', 'admin'));

-- Option 2: Create separate user_roles table (more flexible)
CREATE TABLE user_roles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'business_owner', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, role)
);
```

#### Add Business Ownership Verification

```sql
-- Add verification status to businesses
ALTER TABLE businesses
ADD COLUMN owner_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN owner_verification_requested_at TIMESTAMPTZ,
ADD COLUMN owner_verification_documents JSONB;

-- Create business_ownership_requests table
CREATE TABLE business_ownership_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  verification_documents JSONB,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  UNIQUE(business_id, user_id)
);
```

### 2. **Authentication Service Changes**

#### Add Role Management

```typescript
// src/app/lib/auth.ts
static async getUserRole(userId: string): Promise<string | null> {
  // Get user role from database
}

static async assignRole(userId: string, role: string): Promise<void> {
  // Assign role to user
}

static async isBusinessOwner(userId: string): Promise<boolean> {
  // Check if user is a business owner
}

static async getBusinessesForOwner(userId: string): Promise<Business[]> {
  // Get all businesses owned by user
}
```

#### Add Business Owner Authentication

```typescript
static async signInAsBusinessOwner({ email, password }): Promise<{ user, error }> {
  // Sign in and verify user is a business owner
  // Redirect to business dashboard if successful
}
```

### 3. **Context Changes**

#### Extend AuthContext

```typescript
// src/app/contexts/AuthContext.tsx
interface AuthContextType {
  // ... existing
  userRole: string | null;
  isBusinessOwner: boolean;
  isAdmin: boolean;
  ownedBusinesses: Business[];
  checkBusinessOwnership: (businessId: string) => boolean;
}
```

### 4. **Middleware Changes**

#### Add Business Owner Route Protection

```typescript
// src/middleware.ts
const businessOwnerRoutes = ["/manage-business", "/business/[id]/edit", "/claim-business"];
const isBusinessOwnerRoute = businessOwnerRoutes.some((route) =>
  request.nextUrl.pathname.startsWith(route)
);

if (isBusinessOwnerRoute && user) {
  // Check if user is business owner
  // Redirect if not
}
```

### 5. **Permission Utilities**

#### Create Permission System

```typescript
// src/app/lib/permissions.ts
export const Permissions = {
  BUSINESS_READ: "business:read",
  BUSINESS_WRITE: "business:write",
  BUSINESS_DELETE: "business:delete",
  BUSINESS_MANAGE: "business:manage",
  REVIEW_MODERATE: "review:moderate",
  ADMIN_ALL: "admin:all",
};

export function hasPermission(userRole: string, permission: string): boolean {
  // Check if role has permission
}

export function canEditBusiness(userId: string, businessId: string): Promise<boolean> {
  // Check if user owns the business
}
```

### 6. **Component Changes**

#### Update Business Login Page

```typescript
// src/app/business/login/page.tsx
// Change to use business-specific authentication
// Verify user is business owner after login
// Redirect to business dashboard
```

#### Add Business Ownership Checks

```typescript
// src/app/business/[id]/edit/page.tsx
// Check if user owns business before allowing edit
// Show error/redirect if not owner
```

---

## 📋 Implementation Priority

### Phase 1: Core Role System (High Priority)

1. Add `role` field to profiles table
2. Create role management functions
3. Update AuthContext to include role
4. Add role checks to middleware

### Phase 2: Business Owner Authentication (High Priority)

1. Implement business owner login flow
2. Add business ownership verification
3. Create business claiming workflow
4. Protect business owner routes

### Phase 3: Permission System (Medium Priority)

1. Define permission structure
2. Create permission checking utilities
3. Add permission checks to business operations
4. Update RLS policies with permissions

### Phase 4: Admin System (Low Priority)

1. Create admin role
2. Build admin dashboard
3. Add admin privileges
4. Implement admin tools

---

## 🔐 Security Considerations

1. **Never trust client-side role checks** - Always verify on server/middleware
2. **Use RLS policies** - Database-level security is critical
3. **Validate business ownership** - Check ownership before any business operations
4. **Audit logs** - Track role changes and permission usage
5. **Rate limiting** - Protect authentication endpoints
6. **Session management** - Proper session invalidation on role changes

---

## 📝 Next Steps

1. Review and approve this analysis
2. Decide on role system approach (single role vs. multiple roles)
3. Create database migration scripts
4. Implement Phase 1 (Core Role System)
5. Test authentication flows
6. Implement Phase 2 (Business Owner Auth)
7. Add comprehensive tests
