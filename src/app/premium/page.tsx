"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Pack } from "@/types/pack";
import { THEMES, THEME_ORDER } from "@/lib/themes";

export default function PremiumPage() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [filter, setFilter] = useState<"all" | keyof typeof THEMES>("all");

  useEffect(() => {
    fetch("/api/packs")
      .then((r) => r.json())
      .then(setPacks);
  }, []);

  const premiumPacks = packs.filter((p) => p.isPremium);
  const shown =
    filter === "all"
      ? premiumPacks
      : premiumPacks.filter((p) => p.theme === filter);

  return (
    <main className="text-white">
      {/* MARKETING SECTION */}
      <section className="relative overflow-hidden bg-[#0d1117] pt-20 pb-16 border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(234,179,8,0.15),transparent_70%)]" />
        <div className="container relative mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-black uppercase tracking-widest bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full">
              Premium Content
            </span>
            <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight mb-8">
              Take your decisions <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">
                to the next level.
              </span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed font-medium mb-12">
              Access exclusive tier-1 tournament breakdowns, advanced tactical
              packs, and deep game-vision scenarios derived from pro comms. Stop
              guessing, start knowing.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="w-12 h-12 bg-yellow-500/20 text-yellow-400 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Pro Scenarios</h3>
                <p className="text-sm text-gray-400">Play through the exact situations faced by pros in major tournaments.</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="w-12 h-12 bg-yellow-500/20 text-yellow-400 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Advanced Macro</h3>
                <p className="text-sm text-gray-400">Understand the meta, map control, and high-level team strategies.</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="w-12 h-12 bg-yellow-500/20 text-yellow-400 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Maximum ELO</h3>
                <p className="text-sm text-gray-400">The fastest way to improve your decision making and gain +500 ELO.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-16">
        <header className="mb-10">
          <h2 className="text-4xl font-extrabold">Available Premium Packs</h2>
          <p className="text-gray-400 mt-3 max-w-2xl">
            Unlock individual premium packs to master specific tier-1 fundamentals.
          </p>
        </header>

        <div className="flex flex-wrap gap-2 mb-10">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-full text-sm font-bold border transition ${
              filter === "all"
                ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400"
                : "border-white/15 text-gray-300 hover:bg-white/5"
            }`}
          >
            All Premium
          </button>
          {THEME_ORDER.map((slug) => {
            const t = THEMES[slug];
            const hasPremium = premiumPacks.some((p) => p.theme === slug);
            if (!hasPremium) return null; // Only show filters that have premium packs
            const on = filter === slug;
            return (
              <button
                key={slug}
                onClick={() => setFilter(slug)}
                className={`px-4 py-2 rounded-full text-sm font-bold border transition flex items-center gap-2 ${
                  on
                    ? `bg-yellow-500/10 border-yellow-500/30 text-yellow-400`
                    : "border-white/15 text-gray-300 hover:bg-white/5"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${t.dot}`} />
                {t.name}
              </button>
            );
          })}
        </div>

        {filter === "all" ? (
          <div className="space-y-14">
            {THEME_ORDER.map((slug) => {
              const t = THEMES[slug];
              const group = premiumPacks.filter((p) => p.theme === slug);
              if (group.length === 0) return null;
              return (
                <section key={slug}>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <span className={`h-3 w-3 rounded-full ${t.dot}`} />
                      <h2 className="text-2xl font-extrabold">{t.name}</h2>
                    </div>
                  </div>
                  <PackGrid packs={group} />
                </section>
              );
            })}
          </div>
        ) : (
          <PackGrid packs={shown} />
        )}
      </section>
    </main>
  );
}

function PackGrid({ packs }: { packs: Pack[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {packs.map((p) => {
        const t = THEMES[p.theme] ?? THEMES.training;
        return (
          <Link
            key={p.id}
            href={`/packs/${p.id}`}
            className={`group relative overflow-hidden rounded-xl border border-yellow-500/20 bg-secondary/60 p-6 hover:border-yellow-400/50 transition shadow-lg hover:shadow-yellow-500/10`}
          >
            {p.imageUrl && (
              <div
                className="absolute inset-0 z-0 opacity-20 group-hover:opacity-30 transition bg-cover bg-center"
                style={{ backgroundImage: `url(${p.imageUrl})` }}
              />
            )}
            <div className={`absolute inset-0 z-0 bg-gradient-to-br ${t.gradient} mix-blend-overlay opacity-40`} />
            <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#0d1117]/80 to-transparent" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded ${t.badge}`}>
                    Tier {p.tier}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                    PREMIUM
                  </span>
                </div>
                <span className="text-sm font-bold text-yellow-400">{p.price}</span>
              </div>
              {p.tournament && (
                <div className="text-xs font-semibold text-yellow-500/70 mb-1 uppercase tracking-wider">
                  {p.tournament}
                </div>
              )}
              <h3 className="text-xl font-extrabold leading-tight text-white">{p.name}</h3>
              {p.subtitle && (
                <p className="text-gray-300 text-sm mt-2">{p.subtitle}</p>
              )}
              <div className="flex items-center gap-3 mt-5 text-xs text-gray-400">
                <span>{p.scenarios} scenarios</span>
                {p.difficulty && <span className="capitalize">· {p.difficulty}</span>}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}