"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import type { Scenario } from "@/types/scenario";
import type { Pack } from "@/types/pack";
import ScenarioView from "@/components/ScenarioView";
import { THEMES, THEME_ORDER } from "@/lib/themes";
import { getDifficultyGate, getDefaultDifficulty, type ModeDifficulty } from "@/lib/eloGate";

const COUNT_OPTIONS = [10, 20, 30, 50] as const;

type State = "config" | "loading" | "playing";

const MODE_DIFF: Record<ModeDifficulty, { label: string; packDiff: "beginner" | "intermediate" | "advanced"; desc: string }> = {
  easy:   { label: "Easy",   packDiff: "beginner",     desc: "Beginner ELO multiplier" },
  medium: { label: "Medium", packDiff: "intermediate", desc: "Standard ELO multiplier" },
  hard:   { label: "Hard",   packDiff: "advanced",     desc: "High ELO multiplier"     },
};

export default function MarathonPage() {
  const { data: session } = useSession();
  const elo = session?.user?.elo ?? 1000;
  const gate = getDifficultyGate(elo);

  const [state, setState] = useState<State>("config");
  const [difficulty, setDifficulty] = useState<ModeDifficulty>(() => getDefaultDifficulty(1000));
  const [selectedThemes, setSelectedThemes] = useState<Set<string>>(
    new Set(THEME_ORDER)
  );
  const [count, setCount] = useState<number>(20);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  useEffect(() => {
    setDifficulty(getDefaultDifficulty(elo));
  }, [elo]);
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
        setError("No scenarios found for selected fundamentals. Add free packs first.");
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
      <div className="min-h-[60vh] flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Loading marathon…</p>
        </div>
      </div>
    );
  }

  if (state === "playing") {
    const pack: Pack = {
      id: "marathon",
      name: "Marathon",
      theme: "decision",
      price: "Free",
      imageUrl: "",
      scenarios: scenarios.length,
      difficulty: MODE_DIFF[difficulty].packDiff,
    };
    return (
      <main className="text-white">
        <div className="border-b border-white/10 bg-gradient-to-r from-primary/10 to-transparent">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xs uppercase tracking-widest text-primary font-bold">Marathon Mode</div>
              <h1 className="text-xl font-extrabold">
                {scenarios.length} questions ·{" "}
                <span className="text-gray-300 font-medium text-base">
                  {selectedThemes.size === THEME_ORDER.length
                    ? "All fundamentals"
                    : Array.from(selectedThemes).map((s) => THEMES[s as keyof typeof THEMES]?.name).join(", ")}
                </span>
              </h1>
            </div>
            <button
              onClick={reset}
              className="text-sm font-bold text-gray-400 hover:text-white transition"
            >
              ← New config
            </button>
          </div>
        </div>
        <div className="container mx-auto px-6 py-8">
          <ScenarioView scenarios={scenarios} pack={pack} />
        </div>
      </main>
    );
  }

  return (
    <main className="text-white container mx-auto px-6 py-10 max-w-3xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Marathon Mode</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              Random questions from free packs. Pick your fundamentals and go.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          {error}
        </div>
      )}

      <section className="mb-6">
        <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-3">Difficulty</h2>
        <div className="grid grid-cols-3 gap-3">
          {(Object.entries(MODE_DIFF) as [ModeDifficulty, typeof MODE_DIFF[ModeDifficulty]][]).map(([key, cfg]) => {
            const locked = gate[key].locked;
            const reason = gate[key].reason;
            const active = difficulty === key;
            const activeColor = key === "easy" ? "border-green-500/50 bg-green-500/10 text-green-400 ring-2 ring-green-500/40"
              : key === "medium" ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-400 ring-2 ring-yellow-500/40"
              : "border-red-500/50 bg-red-500/10 text-red-400 ring-2 ring-red-500/40";
            return (
              <button
                key={key}
                onClick={() => !locked && setDifficulty(key)}
                disabled={locked}
                title={reason}
                className={`relative p-3 rounded-xl border-2 text-left transition ${
                  locked
                    ? "border-white/5 bg-white/3 text-gray-600 cursor-not-allowed opacity-50"
                    : active ? activeColor
                    : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                {locked && (
                  <svg className="absolute top-2 right-2 w-3.5 h-3.5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                )}
                <div className="text-sm font-extrabold">{cfg.label}</div>
                <div className="text-xs mt-0.5 opacity-70">{cfg.desc}</div>
                {reason && <div className="text-[10px] mt-1 text-gray-500">{reason}</div>}
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-gray-600 mt-2">Your ELO: <span className="text-gray-400 font-bold">{elo}</span></p>
      </section>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">
            Fundamentals
          </h2>
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedThemes(new Set(THEME_ORDER))}
              className="text-xs font-bold text-primary hover:text-primary/80 transition"
            >
              All
            </button>
            <button
              onClick={() => setSelectedThemes(new Set([THEME_ORDER[0]]))}
              className="text-xs font-bold text-gray-500 hover:text-gray-300 transition"
            >
              Clear
            </button>
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
                className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition group ${
                  on
                    ? `${t.badge} border-transparent ring-1 ring-white/20`
                    : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/8 hover:text-gray-200"
                }`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${t.dot}`} />
                <span className="text-xs font-bold leading-tight">{t.name}</span>
                {on && (
                  <span className="ml-auto shrink-0">
                    <svg className="w-3.5 h-3.5 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-3">
          Questions
        </h2>
        <div className="flex gap-2 flex-wrap">
          {COUNT_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => setCount(n)}
              className={`px-5 py-2 rounded-xl text-sm font-extrabold border transition ${
                count === n
                  ? "bg-primary/20 border-primary/60 text-white"
                  : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-4">
        <button
          onClick={start}
          className="bg-primary hover:bg-primary/90 text-white font-extrabold px-8 py-3 rounded-xl shadow-lg shadow-primary/25 transition active:scale-95 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Start Marathon
        </button>
        <span className="text-sm text-gray-500">
          {selectedThemes.size} fundamental{selectedThemes.size > 1 ? "s" : ""} · {count} questions
        </span>
      </div>
    </main>
  );
}
