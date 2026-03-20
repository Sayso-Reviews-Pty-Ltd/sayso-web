// Business detail pages are always dynamic: they reflect auth state, ownership,
// and personalisation. Using ISR (revalidate) here conflicts with the layout's
// getServerSupabase() call which reads cookies(), causing Next.js to throw
// "Page changed from static to dynamic at runtime" in production.
export const dynamic = 'force-dynamic';

import BusinessClient from "./BusinessClient";

export default function BusinessPage() {
  return <BusinessClient />;
}
