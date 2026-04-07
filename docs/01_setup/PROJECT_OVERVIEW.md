This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# sayso - Local Business Discovery Platform

A Next.js application for discovering and reviewing local businesses with personalized recommendations.

## 🚀 Recent Updates

### Enhanced Interests Selection Flow (2024)

We've implemented a comprehensive interests selection system with production-ready features:

#### **Core Features**

- **Smart Selection Limits**: 3-6 interest minimum/maximum with live counter
- **Real-time API Integration**: Saves to Supabase `user_interests` table
- **Offline Support**: Queues changes when offline, syncs when reconnected
- **Route Protection**: Requires authentication to access
- **Prefetching**: Optimizes next step loading when minimum reached

#### **User Experience Enhancements**

- **Visual Feedback**: Shake animation for over-selection attempts
- **Live Progress**: Color-coded counter with checkmark when minimum met
- **Contextual Messaging**: Helpful hints based on selection state
- **Skip Option**: Direct navigation to subcategories with appropriate messaging
- **Typing Animation**: Engaging headline with cursor effect

#### **Accessibility & Performance**

- **WCAG Compliant**: `aria-pressed`, `aria-live` regions, keyboard navigation
- **Reduced Motion**: Respects `prefers-reduced-motion: reduce`
- **Touch Targets**: 44×44px minimum for mobile devices
- **Lightweight**: 6.76kB bundle size for interests page

#### **Network Resilience**

- **Retry Logic**: 3 attempts with exponential backoff (200ms, 800ms, 1800ms)
- **Error Recovery**: Graceful failures with user-friendly messages
- **Optimistic Updates**: Immediate UI feedback with error rollback
- **Network Detection**: Automatic offline/online state management

#### **Technical Implementation**

```typescript
// Robust save with retry logic
const saveInterests = async (selections: string[], retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch("/api/user/interests", {
        method: "POST",
        body: JSON.stringify({ selections }),
        keepalive: true, // survives navigation
      });
      if (response.ok) return true;
    } catch (error) {
      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, 200 * attempt * attempt));
    }
  }
};

// Offline queue management
if (!navigator.onLine) {
  offlineQueue.current = selections;
  showToast("Working offline - changes will sync when online");
}
```

#### **API Endpoints**

- `POST /api/user/interests` - Save user interest selections
- `GET /api/user/interests` - Retrieve user's current interests

#### **Database Schema**

```sql
-- user_interests table structure
CREATE TABLE user_interests (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  interest_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 📁 Project Structure

```
src/
├── app/
│   ├── interests/           # Enhanced interests selection
│   ├── subcategories/       # Follow-up interest refinement
│   ├── api/user/interests/  # Interest management API
│   └── lib/
│       ├── auth.ts         # Supabase authentication
│       ├── supabase/       # Database clients
│       └── types/          # TypeScript definitions
```

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS with custom animations
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: React Context + hooks
- **Deployment**: Vercel

## 🔧 Development
