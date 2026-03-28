"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Event } from "../../lib/types/Event";
import { normalizeDescriptionText } from "../../lib/utils/descriptionText";
import { Card } from "@/app/components/ui/card";
import { H3, P } from "@/app/components/ui/typography";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/app/components/ui/collapsible";

interface EventDescriptionProps {
  event: Event;
}

export default function EventDescription({ event }: EventDescriptionProps) {
  const normalizedDescription =
    normalizeDescriptionText(event.description) ||
    "Join us for an amazing experience! This event promises to be unforgettable with great company, beautiful surroundings, and memorable moments. Don't miss out on this special opportunity to connect with like-minded people and create lasting memories.";
  const contentRef = useRef<HTMLParagraphElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCollapsible, setIsCollapsible] = useState(false);
  const [collapsedHeight, setCollapsedHeight] = useState<number | null>(null);

  useEffect(() => {
    const measure = () => {
      const el = contentRef.current;
      if (!el) return;

      const styles = window.getComputedStyle(el);
      const parsedLineHeight = Number.parseFloat(styles.lineHeight);
      const lineHeight = Number.isFinite(parsedLineHeight) ? parsedLineHeight : 28;
      const nextCollapsedHeight = Math.round(lineHeight * 5);
      const nextExpandedHeight = Math.ceil(el.scrollHeight);
      const shouldCollapse = nextExpandedHeight > nextCollapsedHeight + 4;

      setCollapsedHeight(nextCollapsedHeight);
      setIsCollapsible(shouldCollapse);

      if (!shouldCollapse) {
        setIsExpanded(false);
      }
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [normalizedDescription]);

  const clampStyle = useMemo(() => {
    if (!isCollapsible || isExpanded) return undefined;
    return { maxHeight: collapsedHeight ?? undefined, overflow: "hidden" as const };
  }, [isCollapsible, isExpanded, collapsedHeight]);

  return (
    <Card variant="detail" className="p-4 sm:p-6 relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-sage/10 to-transparent rounded-full blur-lg" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-coral/10 to-transparent rounded-full blur-lg" />

      <div className="relative z-10">
        <H3 className="mb-3">About This Event</H3>

        <Collapsible open={isExpanded} onOpenChange={setIsCollapsible ? setIsExpanded : undefined}>
          <div style={clampStyle} className="transition-[max-height] duration-300 ease-out">
            <P
              ref={contentRef}
              className="leading-7 whitespace-pre-wrap break-words [overflow-wrap:anywhere]"
            >
              {normalizedDescription}
            </P>
          </div>

          {isCollapsible && (
            <CollapsibleTrigger asChild>
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="mt-3 text-sm font-semibold text-coral hover:text-coral/80 transition-colors duration-200 font-urbanist"
              >
                {isExpanded ? "Read less" : "Read more"}
              </button>
            </CollapsibleTrigger>
          )}
        </Collapsible>
      </div>
    </Card>
  );
}
