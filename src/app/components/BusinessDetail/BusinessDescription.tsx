"use client";

import { Card } from "@/app/components/ui/card";
import { H3, P } from "@/app/components/ui/typography";

type Description = string | { raw: string; friendly: string } | null | undefined;

interface BusinessDescriptionProps {
  description: Description;
}

export default function BusinessDescription({ description }: BusinessDescriptionProps) {
  const getDescriptionText = (): string => {
    if (!description) {
      return "Discover this exceptional business offering quality services and experiences. Visit us to see what makes us special!";
    }

    if (typeof description === "string") {
      return (
        description ||
        "Discover this exceptional business offering quality services and experiences. Visit us to see what makes us special!"
      );
    }

    if (typeof description === "object" && description !== null) {
      const descObj = description as { raw?: string; friendly?: string };
      const friendly = descObj.friendly?.trim();
      const raw = descObj.raw?.trim();
      if (friendly) return friendly;
      if (raw) return raw;
      return "Discover this exceptional business offering quality services and experiences. Visit us to see what makes us special!";
    }

    return "Discover this exceptional business offering quality services and experiences. Visit us to see what makes us special!";
  };

  const descriptionText = getDescriptionText();

  return (
    <Card variant="detail" className="p-4 sm:p-6">
      <H3 className="mb-3">About This Business</H3>
      <P className="leading-relaxed">{descriptionText}</P>
    </Card>
  );
}
