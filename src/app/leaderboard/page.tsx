export const revalidate = 300;

import { Suspense } from "react";
import LeaderboardClient from "./LeaderboardClient";
import LeaderboardSkeleton from "./LeaderboardSkeleton";

export default function LeaderboardPage() {
  return (
    <Suspense fallback={<LeaderboardSkeleton />}>
      <LeaderboardClient />
    </Suspense>
  );
}
