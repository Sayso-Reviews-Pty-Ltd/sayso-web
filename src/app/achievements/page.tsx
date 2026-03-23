"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { m } from 'framer-motion';
import { Trophy, Zap, ChevronLeft, ArrowRight } from "@/app/lib/icons";
import useSWR from 'swr';
import { useAuth } from '../contexts/AuthContext';
import { Loader } from '../components/Loader';
import BadgeModal from '../components/Badges/BadgeModal';
import { Badge } from '../components/Badges/BadgeCard';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import { swrConfig } from '../lib/swrConfig';
import { BADGE_MAPPINGS } from '../lib/badgeMappings';
import { ProgressRing } from './parts/ProgressRing';
import { FloatingParticles } from './parts/FloatingParticles';
import { BadgeMarquee } from './parts/BadgeMarquee';
import { BadgeSection } from './parts/BadgeSection';
import WeeklyChallengesPanel from '../components/Challenges/WeeklyChallengesPanel';
import NextBadgeNudge from '../components/Badges/NextBadgeNudge';

interface BadgeStats {
  total: number;
  earned: number;
  percentage: number;
}

interface GroupedBadges {
  explorer: Badge[];
  specialist: Badge[];
  milestone: Badge[];
  community: Badge[];
}

async function fetchBadgeData(url: string) {
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) throw new Error('Failed to fetch badges');
  return response.json();
}

export default function AchievementsPage() {
  const { user } = useAuth();
  const swrKey = user ? `/api/badges/user?user_id=${user.id}` : null;
  const { data, isLoading, error } = useSWR(swrKey, fetchBadgeData, swrConfig);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const grouped: GroupedBadges | null = data?.grouped ?? null;
  const stats: BadgeStats | null = data?.stats ?? null;

  const allMappings = Object.values(BADGE_MAPPINGS);

  if (isLoading) {
    return (
      <ProtectedRoute requiresAuth={true}>
        <div className="min-h-[100dvh] bg-navbar-bg flex items-center justify-center">
          <Loader size="lg" variant="wavy" color="sage" />
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requiresAuth={true}>
        <div className="min-h-[100dvh] bg-navbar-bg flex items-center justify-center">
          <p className="text-red-400 font-urbanist">Error loading badges: {(error as Error).message}</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiresAuth={true}>
      <div className="min-h-[100dvh] bg-navbar-bg pb-24 relative overflow-hidden">
        <FloatingParticles />

        {/* Ambient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-64 h-64 bg-amber-400/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-40 left-1/3 w-80 h-80 bg-purple-500/6 rounded-full blur-3xl pointer-events-none" />

        {/* Back nav */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-6">
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 font-urbanist text-sm text-white/60 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Profile
          </Link>
        </div>

        {/* ── HERO ── */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-8 pb-12">
          <m.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex flex-col lg:flex-row items-center lg:items-start gap-10"
          >
            {/* Text side */}
            <div className="flex-1 text-center lg:text-left">
              <m.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/15 border border-amber-400/30 mb-6"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="font-urbanist font-600 text-sm text-amber-400">Hall of Achievements</span>
              </m.div>

              <h1 className="font-urbanist font-800 text-5xl sm:text-6xl text-white leading-tight mb-4">
                Collect.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                  Conquer.
                </span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  Dominate.
                </span>
              </h1>

              <p className="font-urbanist text-lg text-white/60 max-w-md mb-8">
                Every review you write, every business you discover — earns you a badge.
                Build your legacy on Sayso.
              </p>

              {stats && (
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  <div className="bg-white/10 border border-white/15 rounded-2xl px-5 py-4 backdrop-blur-sm">
                    <p className="font-urbanist text-xs text-white/50 mb-1">Badges Earned</p>
                    <p className="font-urbanist font-800 text-3xl text-white">
                      {stats.earned}
                      <span className="text-lg text-white/40 ml-1">/ {stats.total}</span>
                    </p>
                  </div>
                  <div className="bg-white/10 border border-white/15 rounded-2xl px-5 py-4 backdrop-blur-sm">
                    <p className="font-urbanist text-xs text-white/50 mb-1">Still to Unlock</p>
                    <p className="font-urbanist font-800 text-3xl text-amber-400">
                      {stats.total - stats.earned}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Ring side */}
            {stats && (
              <m.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="relative">
                  {/* Glow halo */}
                  <div
                    className="absolute inset-0 rounded-full blur-2xl"
                    style={{ background: 'rgba(251,191,36,0.2)', transform: 'scale(1.3)' }}
                  />
                  <div className="relative p-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                    <ProgressRing percentage={stats.percentage} size={200} />
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/10 border border-amber-400/20">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span className="font-urbanist font-700 text-sm text-amber-300">
                    {stats.percentage < 25
                      ? 'Just getting started!'
                      : stats.percentage < 50
                      ? 'Making moves!'
                      : stats.percentage < 75
                      ? 'On a roll!'
                      : stats.percentage < 100
                      ? 'Almost there!'
                      : 'Badge Legend!'}
                  </span>
                </div>
              </m.div>
            )}
          </m.div>
        </div>

        {/* ── MARQUEE ── */}
        <div className="relative z-10 mb-10 py-4">
          <BadgeMarquee badges={allMappings.map((m) => ({ pngPath: m.pngPath, name: m.name }))} />
        </div>

        {/* ── WEEKLY CHALLENGES ── */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 mb-8">
          <WeeklyChallengesPanel userId={user?.id} />
        </div>

        {/* ── UP NEXT (badge progress) ── */}
        {user && (
          <div className="relative z-10 max-w-6xl mx-auto px-4 mb-8">
            <NextBadgeNudge userId={user.id} theme="dark" />
          </div>
        )}

        {/* ── BADGE SECTIONS ── */}
        <div className="relative z-10 max-w-6xl mx-auto px-4">
          {grouped && (
            <>
              {(['explorer', 'specialist', 'milestone', 'community'] as const).map((group) => (
                <BadgeSection
                  key={group}
                  group={group}
                  badges={grouped[group]}
                  onSelectBadge={setSelectedBadge}
                />
              ))}
            </>
          )}
        </div>

        {/* ── BOTTOM CTA ── */}
        <m.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="relative z-10 max-w-6xl mx-auto px-4 mt-6"
        >
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/8 to-white/4 backdrop-blur-sm p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-amber-400" />
            </div>
            <h3 className="font-urbanist font-800 text-2xl text-white mb-2">
              Ready to level up?
            </h3>
            <p className="font-urbanist text-white/50 text-sm mb-6 max-w-sm mx-auto">
              Write reviews, explore new categories and watch your badge collection grow.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link
                href="/for-you"
                className="inline-flex items-center gap-2 bg-white text-navbar-bg font-urbanist font-700 text-sm px-6 py-3 rounded-xl hover:bg-off-white transition-colors"
              >
                Explore Businesses
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/badges"
                className="inline-flex items-center gap-2 border border-white/20 text-white font-urbanist font-600 text-sm px-6 py-3 rounded-xl hover:bg-white/10 transition-colors"
              >
                Badge Library
              </Link>
            </div>
          </div>
        </m.div>

        {/* Badge modal */}
        <BadgeModal badge={selectedBadge} onClose={() => setSelectedBadge(null)} />
      </div>
    </ProtectedRoute>
  );
}
