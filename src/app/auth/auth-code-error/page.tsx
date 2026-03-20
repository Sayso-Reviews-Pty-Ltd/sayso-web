"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ErrorPage from "../../components/ErrorPages/ErrorPage";
import { IoArrowBack } from "react-icons/io5";

function AuthCodeErrorPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const errorParam = searchParams.get('error') || 'Authentication failed';

  return (
    <ErrorPage
      errorType="401"
      title="Authentication Error"
      description={errorParam}
      secondaryAction={{
        label: "Try Again",
        onClick: () => router.push("/login"),
        icon: <IoArrowBack className="w-5 h-5" />,
      }}
    />
  );
}

export default function AuthCodeErrorPage() {
  return (
    <Suspense fallback={<ErrorPage errorType="401" title="Authentication Error" description="Authentication failed" />}>
      <AuthCodeErrorPageContent />
    </Suspense>
  );
}
