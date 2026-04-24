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
      <section className="relative overflow-hidden bg-[#0d1117] pt-10 pb-8 border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(234,179,8,0.15),transparent_70%)]" />
        <div className="container relative mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl">
              <span className="inline-block px-3 py-1 mb-3 text-xs font-black uppercase tracking-widest bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full">
                Premium Content
              </span>
              <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight mb-3">
                Take your decisions{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">
                  to the next level.
                </span>
              </h1>
              <p className="text-sm text-gray-300 leading-relaxed">
                Exclusive tournament breakdowns, advanced tactical packs, and pro game-vision scenarios. Stop guessing, start knowing.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-left shrink-0">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="w-8 h-8 bg-yellow-500/20 text-yellow-400 rounded-lg flex items-center justify-center mb-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                </div>
                <h3 className="text-sm font-bold text-white">Pro Scenarios</h3>
                <p className="text-xs text-gray-400 mt-0.5">Real pro situations.</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="w-8 h-8 bg-yellow-500/20 text-yellow-400 rounded-lg flex items-center justify-center mb-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h3 className="text-sm font-bold text-white">Advanced Macro</h3>
                <p className="text-xs text-gray-400 mt-0.5">Meta & map control.</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="w-8 h-8 bg-yellow-500/20 text-yellow-400 rounded-lg flex items-center justify-center mb-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                </div>
                <h3 className="text-sm font-bold text-white">Maximum ELO</h3>
                <p className="text-xs text-gray-400 mt-0.5">+500 ELO potential.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-8">
        <header className="mb-6">
          <h2 className="text-2xl font-extrabold">Available Premium Packs</h2>
          <p className="text-gray-400 mt-1 text-sm max-w-2xl">
            Unlock individual premium packs to master specific fundamentals.
          </p>
        </header>

        <div className="flex flex-wrap gap-2 mb-6">
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
          <div className="space-y-8">
            {THEME_ORDER.map((slug) => {
              const t = THEMES[slug];
              const group = premiumPacks.filter((p) => p.theme === slug);
              if (group.length === 0) return null;
              return (
                <section key={slug}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`h-2.5 w-2.5 rounded-full ${t.dot}`} />
                    <h2 className="text-lg font-extrabold">{t.name}</h2>
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {packs.map((p) => {
        const t = THEMES[p.theme] ?? THEMES.training;
        return (
          <Link
            key={p.id}
            href={`/packs/${p.id}`}
            className={`group relative overflow-hidden rounded-xl border border-yellow-500/20 bg-secondary/60 p-4 hover:border-yellow-400/50 transition shadow-lg hover:shadow-yellow-500/10`}
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
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-1.5">
                  {p.difficulty && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${t.badge}`}>
                      {p.difficulty}
                    </span>
                  )}
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                    PREMIUM
                  </span>
                </div>
                <span className="text-xs font-bold text-yellow-400">{p.price}</span>
              </div>
              {p.tournament && (
                <div className="text-xs font-semibold text-yellow-500/70 mb-1 uppercase tracking-wider">
                  {p.tournament}
                </div>
              )}
              <h3 className="text-base font-extrabold leading-tight text-white">{p.name}</h3>
              {p.subtitle && (
                <p className="text-gray-300 text-xs mt-1">{p.subtitle}</p>
              )}
              <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                <span>{p.scenarios} scenarios</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}