# Business Ownership Verification & Authentication Workflow

## Overview

This document outlines the complete business ownership verification and authentication workflow implemented in the KLIO application.

## Database Schema

### Tables Created

1. **business_ownership_requests** - Tracks ownership verification requests
2. **business_owners** - Stores verified business owners
3. **businesses** - Extended with verification fields

### Key Fields

- `owner_verified` (boolean) - Whether ownership is verified
- `owner_verification_method` (text) - Method used: 'email', 'phone', 'document', 'manual'
- `owner_verification_requested_at` (timestamp) - When verification was requested

## Workflow Steps

### 1. Business Claiming Flow

1. User searches for business on `/claim-business` page
2. User clicks "Claim" on a business
3. Verification form appears with options:
   - Email verification (send code to business email)
   - Phone verification (send code to business phone)
   - Document upload (business license, tax documents, etc.)
   - Manual review (for complex cases)
4. User submits verification request
5. System creates `business_ownership_request` with status 'pending'
6. User redirected to `/business/verification-status` page

### 2. Verification Methods

#### Email Verification

- System sends verification code to business email
- User enters code to verify
- Auto-approved if code matches

#### Phone Verification

- System sends SMS code to business phone
- User enters code to verify
- Auto-approved if code matches

#### Document Verification

- User uploads proof documents
- Admin reviews documents
- Manual approval/rejection

#### Manual Review

- User submits request with notes
- Admin reviews and approves/rejects

### 3. Verification Status

- **Pending**: Request submitted, awaiting verification
- **Approved**: Ownership verified, user can manage business
- **Rejected**: Request denied (with reason)
- **Cancelled**: User cancelled the request

### 4. Business Login Flow

1. User logs in at `/business/login`
2. System checks if user is a verified business owner
3. If verified:
   - Redirect to `/manage-business` dashboard
   - Show list of owned businesses
4. If not verified:
   - Show message: "You don't have any verified business accounts"
   - Link to `/claim-business` page

## Implementation Files

### Database

- `src/app/lib/schema/business-ownership-verification.sql` - Database schema

### Services

- `src/app/lib/services/businessOwnershipService.ts` - Business ownership service

### Pages

- `src/app/claim-business/page.tsx` - Business claiming page with verification form
- `src/app/business/verification-status/page.tsx` - Verification status page
- `src/app/business/login/page.tsx` - Business login (updated to check ownership)

### Components

- `src/app/components/BusinessClaim/VerificationForm.tsx` - Verification form modal
- `src/app/components/BusinessClaim/VerificationStatusCard.tsx` - Status display component

## Security Considerations

1. **RLS Policies**: All tables have Row Level Security enabled
2. **Ownership Checks**: Always verify ownership server-side
3. **Rate Limiting**: Prevent spam verification requests
4. **Document Storage**: Secure storage for verification documents
5. **Admin Review**: Manual review for document-based verification

## Next Steps

1. ✅ Create database schema
2. ✅ Create business ownership service
3. ⏳ Update claim-business page with verification form
4. ⏳ Create verification status page
5. ⏳ Update business login to check ownership
6. ⏳ Add role field to profiles table
7. ⏳ Create admin review interface
8. ⏳ Add email/SMS verification code sending
9. ⏳ Add document upload functionality
