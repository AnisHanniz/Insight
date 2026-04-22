"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Pack } from "@/types/pack";
import { THEMES, THEME_ORDER } from "@/lib/themes";

export default function FundamentalsPage() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [filter, setFilter] = useState<"all" | keyof typeof THEMES>("all");

  useEffect(() => {
    fetch("/api/packs")
      .then((r) => r.json())
      .then(setPacks);
  }, []);

  const freePacks = packs.filter((p) => !p.isPremium);
  const shown =
    filter === "all" ? freePacks : freePacks.filter((p) => p.theme === filter);

  return (
    <main className="text-white container mx-auto px-6 py-12">
      <header className="mb-10">
        <h1 className="text-5xl font-extrabold">Fundamentals</h1>
        <p className="text-gray-400 mt-3 max-w-2xl">
          Free packs grouped by fundamental. Train your basics and test your decision making
          on essential CS2 scenarios.
        </p>
      </header>

      <div className="flex flex-wrap gap-2 mb-10">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-full text-sm font-bold border transition ${
            filter === "all"
              ? "bg-primary border-primary text-white"
              : "border-white/15 text-gray-300 hover:bg-white/5"
          }`}
        >
          All
        </button>
        {THEME_ORDER.map((slug) => {
          const t = THEMES[slug];
          const on = filter === slug;
          return (
            <button
              key={slug}
              onClick={() => setFilter(slug)}
              className={`px-4 py-2 rounded-full text-sm font-bold border transition flex items-center gap-2 ${
                on
                  ? `${t.badge}`
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
            const group = freePacks.filter((p) => p.theme === slug);
            if (group.length === 0) return null;
            return (
              <section key={slug}>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <span className={`h-3 w-3 rounded-full ${t.dot}`} />
                    <h2 className="text-2xl font-extrabold">{t.name}</h2>
                  </div>
                  <Link
                    href={`/themes/${slug}`}
                    className={`text-sm font-bold ${t.accent}`}
                  >
                    Fundamental details →
                  </Link>
                </div>
                <PackGrid packs={group} />
              </section>
            );
          })}
        </div>
      ) : (
        <PackGrid packs={shown} />
      )}
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
            className={`group relative overflow-hidden rounded-xl border border-white/10 bg-secondary/60 p-6 hover:border-white/25 transition`}
          >
            {p.imageUrl && (
              <div 
                className="absolute inset-0 z-0 opacity-20 group-hover:opacity-30 transition bg-cover bg-center"
                style={{ backgroundImage: `url(${p.imageUrl})` }}
              />
            )}
            <div className={`absolute inset-0 z-0 bg-gradient-to-br ${t.gradient} mix-blend-overlay opacity-60`} />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded ${t.badge}`}>
                    Tier {p.tier}
                  </span>
                  {p.isPremium && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                      PREMIUM
                    </span>
                  )}
                </div>
                <span className="text-sm font-bold text-gray-300">{p.price}</span>
              </div>
              {p.tournament && (
                <div className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">
                  {p.tournament}
                </div>
              )}
              <h3 className="text-xl font-extrabold leading-tight">{p.name}</h3>
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