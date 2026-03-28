"use client";

import Link from "next/link";
import { H1 } from "@/app/components/ui/typography";

export default function SelectAccountTypePage() {
  return (
    <div className="min-h-[100svh] md:  bg-off-white flex flex-col items-center justify-center px-6 py-8">
      <div className="w-full mx-auto max-w-2xl flex flex-col items-center">
        <H1 className="text-3xl sm:text-4xl md:text-5xl leading-[1.2] mb-8">
          Welcome! Please choose an option:
        </H1>
        <div className="flex flex-col gap-6 w-full max-w-md">
          <Link
            href="/login"
            className="font-urbanist w-full py-3 px-4 rounded-full font-semibold bg-card-bg text-white text-center hover:bg-card-bg/90 transition-all duration-300"
          >
            Personal Login
          </Link>
          <Link
            href="/register"
            className="font-urbanist w-full py-3 px-4 rounded-full font-semibold bg-charcoal text-white text-center hover:bg-charcoal/90 transition-all duration-300"
          >
            Personal Register
          </Link>
          <Link
            href="/business/login"
            className="font-urbanist w-full py-3 px-4 rounded-full font-semibold bg-coral text-white text-center hover:bg-coral/90 transition-all duration-300"
          >
            Business Login
          </Link>
          <Link
            href="/business/register"
            className="font-urbanist w-full py-3 px-4 rounded-full font-semibold bg-coral/80 text-white text-center hover:bg-coral transition-all duration-300"
          >
            Business Register
          </Link>
        </div>
      </div>
    </div>
  );
}
