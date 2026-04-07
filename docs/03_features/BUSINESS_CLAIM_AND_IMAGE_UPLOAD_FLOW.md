# Business Claiming and Image Upload Flow

## Overview

This document explains what happens when a business owner claims a business and uploads images, including all edge cases and potential failure points.

---

## Part 1: Business Claiming Flow

### Step-by-Step Process

#### 1. **User Searches for Business**

- **Location**: `/claim-business` or `/for-businesses` page
- **Action**: User types business name (minimum 2 characters)
- **API Call**: `GET /api/businesses/search?query={searchQuery}`
- **Result**: Returns list of businesses with claim status

#### 2. **User Clicks "Claim This Business"**

- **Checks Performed**:
  - ✅ User authenticated? → If not, redirect to `/business/login`
  - ✅ Business already claimed by user? → Redirect to dashboard
  - ✅ Pending claim exists? → Show "Claim pending review" message
  - ✅ Business claimed by someone else? → Show "Business already claimed" message
- **Action**: Opens `ClaimModal` component

#### 3. **User Submits Claim Request**

- **Form Data Collected**:
  - `role`: 'owner' or 'manager'
  - `phone`: Optional phone number
  - `email`: Required email address
  - `note`: Optional additional notes
- **API Call**: `POST /api/business/claim`
- **Request Body**:
  ```json
  {
    "business_id": "uuid",
    "role": "owner",
    "phone": "+1234567890",
    "email": "owner@business.com",
    "note": "Additional information"
  }
  ```

#### 4. **Server-Side Claim Processing**

**Location**: `src/app/api/business/claim/route.ts`

**Validation Steps**:

1. ✅ Check authentication (401 if not authenticated)
2. ✅ Validate `business_id` exists (400 if missing)
3. ✅ Validate `role` is 'owner' or 'manager' (400 if invalid)
4. ✅ Check if user already owns business (400 if duplicate)
5. ✅ Check if pending request exists (400 if duplicate)

**Database Operations**:

```sql
-- Creates record in business_ownership_requests table
INSERT INTO business_ownership_requests (
  business_id,
  user_id,
  status,              -- 'pending'
  verification_method, -- 'manual'
  verification_data    -- JSON with role, phone, email, note
)
```

**Email Notification** (non-blocking):

- Sends confirmation email to user
- Email failure does NOT fail the request

**Response**:

```json
{
  "success": true,
  "request": {
    "id": "request-uuid",
    "business_id": "business-uuid",
    "status": "pending"
  }
}
```

#### 5. **Admin Approval** (Manual Process)

**Location**: `src/app/api/businesses/claims/[id]/approve/route.ts`

**When Admin Approves**:

1. Updates `business_ownership_requests.status` → 'approved'
2. Creates record in `business_owners` table:
   ```sql
   INSERT INTO business_owners (
     business_id,
     user_id,
     role,           -- 'owner' or 'manager'
     verified_at,
     verified_by     -- Admin user ID
   )
   ```
3. Sends approval email to business owner
4. Owner can now access `/owners/businesses/{businessId}` dashboard

---

## Part 2: Image Upload Flow

### Scenario A: Uploading Images During Business Creation

**Location**: `src/app/add-business/page.tsx`

#### Step-by-Step Process:

1. **User Creates Business**
   - Fills out business form
   - Selects images (optional)
   - Submits form

2. **Business Record Created**
   - **API Call**: `POST /api/businesses`
   - Creates business record in database
   - Returns `businessId`

3. **Image Upload Process** (if images selected)

   ```typescript
   // For each image:
   for (let i = 0; i < images.length; i++) {
     // 1. Validate image file
     validateImageFiles(images); // Size, type, format

     // 2. Generate file path
     const filePath = `${businessId}/${businessId}_${i}_${timestamp}.${fileExt}`;

     // 3. Upload to Supabase Storage
     await supabase.storage.from("business-images").upload(filePath, image, {
       cacheControl: "3600",
       upsert: false,
     });

     // 4. Get public URL
     const publicUrl = supabase.storage.from("business-images").getPublicUrl(filePath);

     uploadedUrls.push(publicUrl);
   }
   ```

4. **Save URLs to Database**

   ```typescript
   // Update businesses.uploaded_images array
   await supabase.from("businesses").update({ uploaded_images: uploadedUrls }).eq("id", businessId);
   ```

5. **Rollback on Failure**
   - If DB update fails → Delete uploaded storage files
   - Prevents orphaned files in storage

### Scenario B: Uploading Images After Claiming (Owner Dashboard)

**Location**: `src/app/owners/businesses/[id]/page.tsx` → Edit page

**API Endpoint**: `POST /api/businesses/[id]/images`

#### Process:

1. **Ownership Verification**
   - Checks `business_owners` table OR `businesses.owner_id`
   - Returns 403 if user doesn't own business

2. **Image Upload** (same as Scenario A)
   - Upload to storage
   - Get public URLs

3. **Append to Existing Images**

   ```typescript
   // Get existing uploaded_images array
   const existingImages = business.uploaded_images || [];

   // Append new URLs
   const updatedImages = [...existingImages, ...newUrls];

   // Update database
   await supabase
     .from("businesses")
     .update({ uploaded_images: updatedImages })
     .eq("id", businessId);
   ```

---

## Part 3: Edge Cases and Failure Scenarios

### 🔴 Critical Edge Cases

#### 1. **Storage Upload Succeeds, Database Update Fails**

**Problem**: Images uploaded to storage but URLs not saved to database
**Impact**: Orphaned files in storage, images not visible in UI
**Current Fix**: ✅ **HANDLED**

```typescript
// In add-business/page.tsx (lines 610-625)
if (imagesError) {
  // Clean up orphaned storage files
  const storagePaths = extractStoragePaths(uploadedUrls);
  await supabase.storage.from("business-images").remove(storagePaths);
}
```

**Edge Case**: What if cleanup fails?

- **Risk**: Orphaned files remain in storage
- **Mitigation**: Log error, admin can manually clean up
- **Future Fix**: Implement background job to detect orphaned files

#### 2. **Partial Image Upload Failure**

**Problem**: Some images upload successfully, others fail
**Current Behavior**:

- Successful uploads: URLs saved to database
- Failed uploads: Error logged, user notified
- **Issue**: Database may have partial image array

**Example**:

```typescript
// User uploads 5 images
// Images 1-3: ✅ Success
// Image 4: ❌ Network timeout
// Image 5: ✅ Success
// Result: uploaded_images = [url1, url2, url3, url5] // Missing url4
```

**Current Fix**: ✅ **HANDLED** - Each image upload is independent

- Failed uploads are skipped
- Only successful URLs are added to array
- User sees error message for failed uploads

#### 3. **Business Deleted During Image Upload**

**Problem**: User starts uploading images, business gets deleted
**Previous Behavior**:

- Upload continues (no check for business existence)
- URLs saved to non-existent business
- **Issue**: Orphaned URLs in database (business record deleted)

**Status**: ✅ **FIXED**

**Solution Implemented**:

- Business existence check before saving URLs
- Automatic cleanup of storage files if business deleted
- User-friendly error message

**Implementation**:

```typescript
// In add-business/page.tsx (lines 600-625)
// Verify business still exists before saving URLs
const { data: businessCheck, error: businessCheckError } = await supabase
  .from("businesses")
  .select("id")
  .eq("id", businessId)
  .single();

if (businessCheckError || !businessCheck) {
  // Business deleted - cleanup storage files
  await supabase.storage.from("business-images").remove(storagePaths);
  showToast("Business was deleted during upload...");
}
```

#### 4. **Concurrent Image Uploads**

**Problem**: Multiple users/requests uploading images simultaneously
**Previous Behavior**:

- Last write wins (race condition)
- Some images may be lost

**Status**: ✅ **FIXED**

**Solution Implemented**:

- Created `append_business_images()` PostgreSQL function
- Uses atomic array concatenation operator (`||`)
- Prevents race conditions with concurrent uploads
- Function validates image limit before appending

**Implementation**:

```sql
-- PostgreSQL function (supabase/migrations/20250114_append_business_images_function.sql)
CREATE OR REPLACE FUNCTION public.append_business_images(
  p_business_id UUID,
  p_image_urls TEXT[]
)
-- Uses atomic array concatenation: current_images || new_urls
```

**Fallback**: If function doesn't exist, code re-fetches business state before updating to reduce race conditions

#### 5. **Storage Quota Exceeded**

**Problem**: Supabase storage quota reached
**Current Behavior**:

- Upload fails with error message
- User sees: "Storage limit reached. Please delete old images or contact support."
- ✅ **HANDLED** - Error message is user-friendly

**Edge Case**: What if quota exceeded mid-upload?

- Some images uploaded, others fail
- Partial success scenario (see Edge Case #2)

#### 6. **Invalid Image Files**

**Problem**: User uploads non-image files or corrupted files
**Current Behavior**: ✅ **HANDLED**

```typescript
// Validation before upload (lines 544-554)
const validationResults = validateImageFiles(images);
// Checks:
// - File type (JPG, PNG, WebP, GIF)
// - File size (< 5MB)
// - Valid image format
```

**Edge Case**: What if validation passes but file is corrupted?

- Upload succeeds
- Image may not display in browser
- **Mitigation**: Browser handles gracefully (shows broken image icon)

#### 7. **Network Interruption During Upload**

**Problem**: User's network disconnects mid-upload
**Current Behavior**:

- Upload fails, error shown to user
- No partial state saved
- User must retry

**Edge Case**: What if network reconnects and user retries?

- May create duplicate uploads if not handled
- **Current Fix**: Uses unique filenames with timestamp → Prevents duplicates

#### 8. **Business Owner Changes During Claim Process**

**Problem**: Business gets claimed by someone else while user's claim is pending
**Current Behavior**:

- Claim request remains in 'pending' status
- Admin sees both requests
- Admin must manually reject duplicate

**Mitigation**:

- Check claim status before creating request ✅ (already done)
- Auto-reject pending requests when business gets claimed
- **Future Fix**: Add trigger to auto-reject pending requests on approval

#### 9. **Image URL Becomes Invalid**

**Problem**: Storage file deleted but URL still in database
**Current Behavior**:

- Image shows broken/404 in UI
- No automatic cleanup

**Edge Case**: What if storage file is deleted externally?

- Database still has URL
- UI shows broken image
- **Mitigation**: Implement health check to detect broken URLs

#### 10. **Maximum Image Limit**

**Problem**: User tries to upload too many images
**Previous Behavior**:

- No explicit limit enforced
- May cause performance issues with large arrays

**Status**: ✅ **FIXED**

**Solution Implemented**:

- Maximum 10 images per business enforced
- Validation in both API endpoint and add-business page
- User-friendly error messages
- Automatic truncation with warning

**Implementation**:

```typescript
// In POST /api/businesses/[id]/images (lines 145-171)
const MAX_IMAGES = 10;
if (currentCount + newCount > MAX_IMAGES) {
  return NextResponse.json(
    {
      error: `Maximum image limit reached (${MAX_IMAGES} images)...`,
    },
    { status: 400 }
  );
}
```

---

## Part 4: Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    BUSINESS CLAIMING FLOW                    │
└─────────────────────────────────────────────────────────────┘

User → Search Business → Click "Claim" → Submit Form
  │
  ├─→ POST /api/business/claim
  │     │
  │     ├─→ Validate Request
  │     ├─→ Check Duplicates
  │     ├─→ Create business_ownership_requests record
  │     └─→ Send Email (non-blocking)
  │
  └─→ Wait for Admin Approval
        │
        └─→ Admin Approves → Create business_owners record
              │
              └─→ User Can Now Access Dashboard

┌─────────────────────────────────────────────────────────────┐
│                    IMAGE UPLOAD FLOW                         │
└─────────────────────────────────────────────────────────────┘

User → Select Images → Upload
  │
  ├─→ Validate Images (size, type, format)
  │
  ├─→ For Each Image:
  │     │
  │     ├─→ Upload to Supabase Storage
  │     │     └─→ Get Public URL
  │     │
  │     └─→ Add URL to uploadedUrls array
  │
  ├─→ Update businesses.uploaded_images
  │     │
  │     ├─→ Success → ✅ Done
  │     │
  │     └─→ Failure → Rollback (delete storage files)
  │
  └─→ Display Images in UI
```

---

## Part 5: Database Schema

### Relevant Tables:

```sql
-- Business ownership request
business_ownership_requests (
  id UUID PRIMARY KEY,
  business_id UUID REFERENCES businesses(id),
  user_id UUID REFERENCES auth.users(id),
  status TEXT, -- 'pending', 'approved', 'rejected', 'cancelled'
  verification_method TEXT, -- 'email', 'phone', 'document', 'manual'
  verification_data JSONB, -- { role, phone, email, note }
  created_at TIMESTAMP,
  reviewed_at TIMESTAMP,
  reviewed_by UUID
)

-- Business owners (after approval)
business_owners (
  id UUID PRIMARY KEY,
  business_id UUID REFERENCES businesses(id),
  user_id UUID REFERENCES auth.users(id),
  role TEXT, -- 'owner', 'manager'
  verified_at TIMESTAMP,
  verified_by UUID
)

-- Businesses table
businesses (
  id UUID PRIMARY KEY,
  name TEXT,
  uploaded_images TEXT[], -- Array of image URLs
  owner_id UUID REFERENCES auth.users(id), -- Legacy field
  ...
)
```

---

## Part 6: Best Practices & Recommendations

### ✅ Current Implementations (Good)

1. **Rollback on DB Failure**: Storage files cleaned up if DB update fails
2. **Image Validation**: Files validated before upload
3. **Error Handling**: User-friendly error messages
4. **Non-blocking Emails**: Email failures don't break the flow
5. **Ownership Verification**: Multiple checks before allowing image uploads

### ✅ Recent Fixes (Implemented)

1. **Race Condition Handling**: ✅ **FIXED** - Created `append_business_images()` PostgreSQL function using atomic array concatenation
2. **Image Limit**: ✅ **FIXED** - Enforced maximum 20 images per business with validation
3. **Business Existence Check**: ✅ **FIXED** - Verify business exists before saving image URLs
4. **Error Handling**: ✅ **IMPROVED** - Better handling for business deletion during upload

### ⚠️ Areas for Future Improvement

1. **Orphaned File Detection**: Background job to find and clean orphaned files
2. **Health Checks**: Periodic check for broken image URLs
3. **Retry Logic**: Automatic retry for failed uploads
4. **Progress Tracking**: Show upload progress for large files
5. **Image Compression**: Compress images before upload to save storage

---

## Part 7: Testing Scenarios

### Test Cases to Verify:

1. ✅ **Happy Path**: Claim business → Get approved → Upload images → Success
2. ✅ **Storage Failure**: Upload succeeds, DB update fails → Verify rollback
3. ✅ **Partial Upload**: Some images succeed, others fail → Verify partial success
4. ✅ **Concurrent Uploads**: Two users upload simultaneously → Verify no data loss
5. ✅ **Invalid Files**: Upload non-image files → Verify validation
6. ✅ **Network Failure**: Disconnect network mid-upload → Verify error handling
7. ✅ **Quota Exceeded**: Fill storage quota → Verify error message
8. ✅ **Business Deleted**: Delete business during upload → Verify cleanup
9. ✅ **Duplicate Claims**: Two users claim same business → Verify duplicate prevention
10. ✅ **Large Files**: Upload files > 5MB → Verify size validation

---

## Summary

The business claiming and image upload flow is **well-implemented** with proper error handling and rollback mechanisms. The main areas for improvement are:

1. **Race condition handling** for concurrent uploads
2. **Orphaned file detection** and cleanup
3. **Image limit enforcement**
4. **Health checks** for broken image URLs

All critical edge cases are either handled or have clear mitigation strategies in place.
