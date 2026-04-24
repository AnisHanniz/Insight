"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import type { Scenario } from "@/types/scenario";
import BoltView from "@/components/BoltView";
import { THEMES, THEME_ORDER } from "@/lib/themes";
import { getDifficultyGate, getDefaultDifficulty, type ModeDifficulty } from "@/lib/eloGate";

type Difficulty = ModeDifficulty;
type State = "config" | "loading" | "playing";

const DIFF_CONFIG = {
  easy:   { label: "Easy",   seconds: 30, desc: "30s per question",  color: "border-green-500/50 bg-green-500/10 text-green-400",  check: "ring-green-500"  },
  medium: { label: "Medium", seconds: 15, desc: "15s per question",  color: "border-yellow-500/50 bg-yellow-500/10 text-yellow-400", check: "ring-yellow-500" },
  hard:   { label: "Hard",   seconds: 8,  desc: "8s per question",   color: "border-red-500/50 bg-red-500/10 text-red-400",    check: "ring-red-500"    },
} as const;

const COUNT_OPTIONS = [5, 10, 15, 20] as const;

export default function BoltPage() {
  const { data: session } = useSession();
  const elo = session?.user?.elo ?? 1000;
  const gate = getDifficultyGate(elo);

  const [state, setState] = useState<State>("config");
  const [difficulty, setDifficulty] = useState<Difficulty>(() => getDefaultDifficulty(1000));

  useEffect(() => {
    setDifficulty(getDefaultDifficulty(elo));
  }, [elo]);
  const [selectedThemes, setSelectedThemes] = useState<Set<string>>(new Set(THEME_ORDER));
  const [count, setCount] = useState(10);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [error, setError] = useState<string | null>(null);

  function toggleTheme(slug: string) {
    setSelectedThemes((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        if (next.size === 1) return prev;
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  }

  async function start() {
    setState("loading");
    setError(null);
    try {
      const themes = Array.from(selectedThemes).join(",");
      const res = await fetch(`/api/marathon?themes=${themes}&count=${count}`);
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        setError("No scenarios found. Make sure free packs exist for selected fundamentals.");
        setState("config");
        return;
      }
      setScenarios(data);
      setState("playing");
    } catch {
      setError("Failed to load scenarios. Try again.");
      setState("config");
    }
  }

  function reset() {
    setState("config");
    setScenarios([]);
    setError(null);
  }

  if (state === "loading") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Charging bolt…</p>
        </div>
      </div>
    );
  }

  if (state === "playing") {
    return (
      <main className="text-white">
        <div className="border-b border-white/10 bg-gradient-to-r from-red-900/20 to-transparent">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xs uppercase tracking-widest text-red-400 font-bold flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Bolt Mode
              </div>
              <h1 className="text-xl font-extrabold">
                {scenarios.length} questions ·{" "}
                <span className={`font-black ${difficulty === "easy" ? "text-green-400" : difficulty === "medium" ? "text-yellow-400" : "text-red-400"}`}>
                  {DIFF_CONFIG[difficulty].label}
                </span>
                <span className="text-gray-400 font-normal text-base"> · {DIFF_CONFIG[difficulty].seconds}s</span>
              </h1>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-6 py-8">
          <BoltView scenarios={scenarios} difficulty={difficulty} onReset={reset} />
        </div>
      </main>
    );
  }

  return (
    <main className="text-white container mx-auto px-6 py-10 max-w-3xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Bolt Mode</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              Beat the clock. Every second counts.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Difficulty */}
      <section className="mb-8">
        <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-3">Difficulty</h2>
        <div className="grid grid-cols-3 gap-3">
          {(Object.entries(DIFF_CONFIG) as [Difficulty, typeof DIFF_CONFIG[Difficulty]][]).map(([key, cfg]) => {
            const locked = gate[key].locked;
            const reason = gate[key].reason;
            const active = difficulty === key;
            return (
              <button
                key={key}
                onClick={() => !locked && setDifficulty(key)}
                disabled={locked}
                title={reason}
                className={`relative p-4 rounded-xl border-2 text-left transition ${
                  locked
                    ? "border-white/5 bg-white/3 text-gray-600 cursor-not-allowed opacity-50"
                    : active
                    ? cfg.color + " ring-2 " + cfg.check
                    : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                {locked && (
                  <div className="absolute top-2 right-2">
                    <svg className="w-3.5 h-3.5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {active && !locked && (
                  <div className="absolute top-2 right-2">
                    <svg className="w-4 h-4 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <div className="text-lg font-extrabold">{cfg.label}</div>
                <div className="text-xs mt-0.5 opacity-80">{cfg.desc}</div>
                {reason && <div className="text-[10px] mt-1 text-gray-500">{reason}</div>}
              </button>
            );
          })}
        </div>
      </section>

      {/* Questions count */}
      <section className="mb-8">
        <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-3">Questions</h2>
        <div className="flex gap-2">
          {COUNT_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => setCount(n)}
              className={`px-5 py-2 rounded-xl text-sm font-extrabold border transition ${
                count === n
                  ? "bg-red-500/20 border-red-500/60 text-white"
                  : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </section>

      {/* Fundamentals */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">Fundamentals</h2>
          <div className="flex gap-3">
            <button onClick={() => setSelectedThemes(new Set(THEME_ORDER))} className="text-xs font-bold text-primary hover:text-primary/80">All</button>
            <button onClick={() => setSelectedThemes(new Set([THEME_ORDER[0]]))} className="text-xs font-bold text-gray-500 hover:text-gray-300">Clear</button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {THEME_ORDER.map((slug) => {
            const t = THEMES[slug];
            const on = selectedThemes.has(slug);
            return (
              <button
                key={slug}
                onClick={() => toggleTheme(slug)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition text-xs font-bold ${
                  on
                    ? `${t.badge} border-transparent ring-1 ring-white/20`
                    : "bg-white/5 border-white/10 text-gray-400 hover:text-gray-200"
                }`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${t.dot}`} />
                {t.name}
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex items-center gap-4">
        <button
          onClick={start}
          className="bg-red-500 hover:bg-red-400 text-white font-extrabold px-8 py-3 rounded-xl shadow-lg shadow-red-500/25 transition active:scale-95 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Start Bolt
        </button>
        <span className="text-sm text-gray-500">
          {count} questions · {DIFF_CONFIG[difficulty].seconds}s each
        </span>
      </div>
    </main>
  );
}
