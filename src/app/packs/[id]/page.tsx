"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Pack } from "@/types/pack";
import { useSession } from "next-auth/react";
import { THEMES } from "@/lib/themes";

export default function PackDetailPage() {
  const { data: session } = useSession();
  const [pack, setPack] = useState<Pack | null>(null);
  const params = useParams();
  const { id: packId } = params;

  useEffect(() => {
    if (packId) {
      fetch(`/api/packs/${packId}`)
        .then((r) => r.json())
        .then(setPack);
    }
  }, [packId]);

  if (!pack) {
    return (
      <div className="container mx-auto p-8 text-white">Loading...</div>
    );
  }

  const t = THEMES[pack.theme] ?? THEMES.training;

  return (
    <main className="text-white">
      <section
        className={`relative overflow-hidden border-b border-white/10`}
      >
        {pack.imageUrl && (
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center opacity-30 mix-blend-luminosity"
            style={{ backgroundImage: `url(${pack.imageUrl})` }}
          />
        )}
        <div className={`absolute inset-0 z-0 bg-gradient-to-br ${t.gradient} mix-blend-overlay opacity-80`} />
        <div className="container mx-auto px-6 py-14 relative z-10">
          <Link
            href={`/themes/${pack.theme}`}
            className={`text-sm font-bold ${t.accent} hover:underline`}
          >
            ← {t.name}
          </Link>
          <div className="flex items-center gap-2 mt-5">
            <span className={`text-xs font-bold px-2.5 py-1 rounded ${t.badge}`}>
              Tier {pack.tier}
            </span>
            {pack.difficulty && (
              <span className="text-xs font-bold px-2.5 py-1 rounded bg-white/10 text-gray-200 capitalize">
                {pack.difficulty}
              </span>
            )}
            <span className="text-xs font-bold px-2.5 py-1 rounded bg-white/10 text-gray-200">
              {pack.scenarios} scenarios
            </span>
            {pack.isPremium && (
              <span className="text-xs font-bold px-2.5 py-1 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                PREMIUM
              </span>
            )}
          </div>
          {pack.tournament && (
            <div className="text-sm font-semibold text-gray-300 mt-4 uppercase tracking-wider">
              {pack.tournament}
            </div>
          )}
          <h1 className="text-5xl md:text-6xl font-extrabold mt-1 max-w-3xl">
            {pack.name}
          </h1>
          {pack.subtitle && (
            <p className="text-xl text-gray-200 mt-3 max-w-3xl">
              {pack.subtitle}
            </p>
          )}
        </div>
      </section>

      <section className="container mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-extrabold mb-4">About this pack</h2>
          <p className="text-gray-300 leading-relaxed">
            {pack.description ?? "No description provided."}
          </p>

          <h3 className="text-xl font-extrabold mt-10 mb-4">
            Subcategories covered
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {t.subcategories.map((s) => (
              <li
                key={s}
                className="flex items-start gap-2 text-gray-300 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5"
              >
                <span className={`${t.accent} mt-0.5`}>●</span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        <aside className="bg-white/5 border border-white/10 rounded-xl p-6 h-fit sticky top-6">
          <div className="flex items-baseline justify-between mb-6">
            <span className="text-gray-400 text-sm">Price</span>
            <span className="text-2xl font-extrabold">{pack.price}</span>
          </div>
          {pack.isPremium && (!session?.user?.packsUnlocked || !session.user.packsUnlocked.includes(pack.id)) ? (
            <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-extrabold py-3.5 rounded-lg shadow-lg shadow-yellow-600/30 transition flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Unlock now
            </button>
          ) : (
            <Link href={`/play/${pack.id}`}>
              <button className="w-full bg-primary hover:bg-dark-2 text-white font-extrabold py-3.5 rounded-lg shadow-lg shadow-primary/30 transition">
                Play now
              </button>
            </Link>
          )}
          <p className="text-xs text-gray-500 mt-4 leading-relaxed">
            You&apos;ll be graded on every decision: Perfect, Excellent, Good,
            or Blunder. Feedback is shown after each choice.
          </p>
        </aside>
      </section>
    </main>
  );
}
