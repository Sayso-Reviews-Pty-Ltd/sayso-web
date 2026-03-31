"use client";

import { useState, useRef, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export default function BusinessTooltip({ content, children, position = "top" }: TooltipProps) {
  const [isTruncated, setIsTruncated] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkTruncation = () => {
      if (triggerRef.current) {
        const element = triggerRef.current.querySelector("h3, span, div") as HTMLElement;
        if (element) {
          setIsTruncated(element.scrollWidth > element.clientWidth);
        }
      }
    };

    checkTruncation();
    window.addEventListener("resize", checkTruncation);
    return () => window.removeEventListener("resize", checkTruncation);
  }, [content]);

  return (
    <TooltipProvider>
      {/* open={false} disables the tooltip when text is not truncated */}
      <Tooltip open={isTruncated ? true : false}>
        <TooltipTrigger asChild>
          <div ref={triggerRef} className="w-full">
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent side={position}>{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
