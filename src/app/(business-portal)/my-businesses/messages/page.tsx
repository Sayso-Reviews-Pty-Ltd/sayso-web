"use client";

import Link from "next/link";
import MessagingWorkspace from "@/app/components/Messaging/MessagingWorkspace";
import { useAuth } from "@/app/contexts/AuthContext";
import { useOwnerBusinessesList } from "@/app/hooks/useOwnerBusinessesList";
import { useSearchParams } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/app/components/ui/breadcrumb";
import { Skeleton } from "@/app/components/ui/skeleton";

export default function BusinessMessagesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const searchParams = useSearchParams();

  const { businesses, isLoading: businessesLoading } = useOwnerBusinessesList(user?.id || null);

  if (authLoading || businessesLoading) {
    return (
      <div className="bg-off-white">
        <div className="mx-auto flex w-full max-w-7xl overflow-hidden sm:rounded-xl sm:border sm:border-charcoal/8 sm:shadow-sm h-[calc(100dvh-3.5rem)] lg:h-[100dvh]">
          {/* Conversation list sidebar skeleton */}
          <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 flex flex-col border-r border-charcoal/8 bg-white">
            {/* Sidebar header */}
            <div className="px-4 py-4 border-b border-charcoal/8">
              <Skeleton className="h-6 w-20 mb-3" />
              <Skeleton className="h-9 w-full rounded-full" />
            </div>

            {/* Conversation items */}
            <div className="flex-1 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 px-4 py-3.5 border-b border-charcoal/6"
                >
                  <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-10" />
                    </div>
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Thread pane skeleton (desktop) */}
          <div className="hidden lg:flex min-w-0 flex-1 flex-col bg-off-white">
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <Skeleton className="h-20 w-20 rounded-full" />
              <Skeleton className="mt-4 h-5 w-32" />
              <Skeleton className="mt-2 h-4 w-56" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const businessOptions = businesses.map((business: any) => ({
    id: business.id,
    name: business.name,
    image_url: business.image_url || null,
  }));

  const initialConversationId = searchParams?.get("conversation") || null;
  const initialBusinessId = searchParams?.get("business_id") || null;
  const startUserId = searchParams?.get("user_id") || null;

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem)] lg:h-[100dvh]">
      <div className="flex-shrink-0 px-4 sm:px-6">
        <Breadcrumb className="pt-4 sm:pt-6 pb-2">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/my-businesses">My Businesses</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Inbox</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <MessagingWorkspace
        role="business"
        title="Inbox"
        subtitle="All customer conversations"
        viewportClassName="flex-1 min-h-0"
        businessOptions={businessOptions}
        initialBusinessId={initialBusinessId}
        initialConversationId={initialConversationId}
        startBusinessId={initialBusinessId}
        startUserId={startUserId}
      />
    </div>
  );
}
