'use client';

import Image from 'next/image';
import { m } from 'framer-motion';

export function BadgeMarquee({ badges }: { badges: { pngPath: string; name: string }[] }) {
  const doubled = [...badges, ...badges];
  return (
    <div className="relative overflow-hidden w-full">
      <div className="absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-navbar-bg to-transparent" />
      <div className="absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-navbar-bg to-transparent" />
      <m.div
        className="flex gap-4 w-max"
        animate={{ x: [0, -badges.length * 76] }}
        transition={{ duration: badges.length * 3, repeat: Infinity, ease: 'linear' }}
      >
        {doubled.map((b, i) => (
          <div
            key={i}
            className="w-16 h-16 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0 backdrop-blur-sm"
          >
            <Image src={b.pngPath} alt={b.name} width={40} height={40} className="object-contain" unoptimized />
          </div>
        ))}
      </m.div>
    </div>
  );
}
