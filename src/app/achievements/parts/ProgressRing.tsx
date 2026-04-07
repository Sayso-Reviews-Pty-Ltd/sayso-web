"use client";

import { useState, useEffect } from "react";
import { useMotionValue, useSpring } from "framer-motion";

export function ProgressRing({ percentage, size = 180 }: { percentage: number; size?: number }) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const motionPct = useMotionValue(0);
  const springPct = useSpring(motionPct, { stiffness: 50, damping: 20 });
  const [displayPct, setDisplayPct] = useState(0);
  const [dashOffset, setDashOffset] = useState(circumference);

  useEffect(() => {
    motionPct.set(percentage);
    const unsub = springPct.on("change", (v) => {
      setDisplayPct(Math.round(v));
      setDashOffset(circumference - (v / 100) * circumference);
    });
    return unsub;
  }, [percentage, motionPct, springPct, circumference]);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={10}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGrad)"
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 0.05s linear" }}
        />
        <defs>
          <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FFA500" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-urbanist font-800 text-4xl text-white leading-none">
          {displayPct}%
        </span>
        <span className="font-urbanist text-xs text-white/60 mt-1">complete</span>
      </div>
    </div>
  );
}
