"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import type { Scenario, OptionQuality } from "@/types/scenario";
import { QUALITY, qualityOf } from "@/lib/themes";
import MapOverlayRenderer from "@/components/MapOverlayRenderer";
import AnimatedNumber from "@/components/AnimatedNumber";

type Verdict = { scenarioId: string; quality: OptionQuality; score: number; timedOut: boolean };

const DIFFICULTY_CONFIG = {
  easy:   { label: "Easy",   seconds: 30, color: "text-green-400",  bar: "bg-green-500",  ring: "ring-green-500/40"  },
  medium: { label: "Medium", seconds: 15, color: "text-yellow-400", bar: "bg-yellow-500", ring: "ring-yellow-500/40" },
  hard:   { label: "Hard",   seconds: 8,  color: "text-red-400",    bar: "bg-red-500",    ring: "ring-red-500/40"    },
} as const;

type Difficulty = keyof typeof DIFFICULTY_CONFIG;

export default function BoltView({
  scenarios,
  difficulty,
  onReset,
}: {
  scenarios: Scenario[];
  difficulty: Difficulty;
  onReset: () => void;
}) {
  const { data: session } = useSession();
  const cfg = DIFFICULTY_CONFIG[difficulty];
  const total = scenarios.length;

  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(cfg.seconds);
  const [selected, setSelected] = useState<number | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [verdicts, setVerdicts] = useState<Verdict[]>([]);
  const [done, setDone] = useState(false);
  const [eloDelta, setEloDelta] = useState<number | null>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = scenarios[index];

  const currentOptions = useMemo(() => {
    if (!current) return [];
    const arr = [...current.options];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [current?.id]);

  // Countdown
  useEffect(() => {
    if (selected !== null || timedOut || done) return;
    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, selected, timedOut, done]);

  function handleTimeout() {
    setTimedOut(true);
    const verdict: Verdict = { scenarioId: current.id, quality: "blunder", score: 0, timedOut: true };
    setVerdicts((v) => [...v, verdict]);
    scheduleAdvance();
  }

  function handleSelect(optId: number) {
    if (selected !== null || timedOut) return;
    setSelected(optId);
    const opt = current.options.find((o) => o.id === optId);
    if (!opt) return;
    const q = qualityOf(opt);
    setVerdicts((v) => [...v, { scenarioId: current.id, quality: q, score: QUALITY[q].score, timedOut: false }]);
    try {
      const sound = q === "blunder" ? "/sounds/incorrect.mp3" : "/sounds/correct.mp3";
      new Audio(sound).play().catch(() => {});
    } catch {}
    scheduleAdvance();
  }

  function scheduleAdvance() {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => advance(), 2200);
  }

  function advance() {
    if (index + 1 >= total) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
      setTimedOut(false);
      setTimeLeft(cfg.seconds as number);
    }
  }

  // ELO on done
  useEffect(() => {
    if (!done || !session?.user?.id) return;
    const maxScore = total * 100;
    const score = verdicts.reduce((a, v) => a + v.score, 0);
    const scorePct = maxScore === 0 ? 0 : Math.round((score / maxScore) * 100);
    const qualities = verdicts.reduce<Record<string, number>>((acc, v) => {
      acc[v.quality] = (acc[v.quality] ?? 0) + 1;
      return acc;
    }, {});
    fetch(`/api/users/${session.user.id}/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packId: "bolt", scorePct, difficulty, qualities }),
    })
      .then((r) => r.json())
      .then((d) => { if (d.delta !== undefined) setEloDelta(d.delta); })
      .catch(console.error);
  }, [done]);

  if (done) {
    return <BoltSummary verdicts={verdicts} scenarios={scenarios} eloDelta={eloDelta} onReset={onReset} />;
  }

  const pct = (timeLeft / cfg.seconds) * 100;
  const urgent = timeLeft <= Math.ceil(cfg.seconds * 0.3);
  const revealed = selected !== null || timedOut;
  const pickedOpt = selected !== null ? current.options.find((o) => o.id === selected) : null;
  const pickedQ = pickedOpt ? qualityOf(pickedOpt) : timedOut ? "blunder" : null;

  return (
    <div className="text-white">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-widest text-gray-400 font-bold">
            {index + 1} / {total}
          </span>
          <span className={`text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
            difficulty === "easy" ? "border-green-500/40 text-green-400" :
            difficulty === "medium" ? "border-yellow-500/40 text-yellow-400" :
            "border-red-500/40 text-red-400"
          }`}>
            {cfg.label}
          </span>
        </div>
        <button onClick={onReset} className="text-xs text-gray-500 hover:text-gray-300 transition">
          ← New config
        </button>
      </div>

      {/* Timer */}
      <div className="mb-5">
        <div className={`flex items-center gap-3 mb-2 ${urgent ? "animate-pulse" : ""}`}>
          <div className={`text-5xl font-black tabular-nums ${cfg.color} ${urgent ? "drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]" : ""}`}>
            {String(timeLeft).padStart(2, "0")}
          </div>
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Time remaining</div>
            <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  pct > 60 ? "bg-green-500" : pct > 30 ? "bg-yellow-500" : "bg-red-500"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scenario content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          {current.video ? (
            <div className="w-full rounded-xl overflow-hidden bg-black aspect-video border border-white/10">
              {current.video.includes("youtu") ? (
                <iframe
                  src={`https://www.youtube.com/embed/${current.video.match(/(?:youtu\.be\/|v=)([^&]+)/)?.[1]}`}
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : (
                <video src={current.video} controls className="w-full h-full object-cover" />
              )}
            </div>
          ) : current.image && current.image.startsWith("/") ? (
            <div className="relative mx-auto bg-slate-900 rounded-xl overflow-hidden border border-white/10" style={{ aspectRatio: "1 / 1", width: "100%", maxWidth: "min(60vh, 100%)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={current.image} alt={current.title} draggable={false} className="w-full h-full object-contain pointer-events-none" />
              <MapOverlayRenderer overlay={current.overlay} />
            </div>
          ) : null}

          <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
            <h2 className="text-xl font-extrabold mb-1">{current.title}</h2>
            {current.map && <div className="text-xs text-gray-500 mb-2">Map: {current.map}</div>}
            <p className="text-gray-200 leading-relaxed text-sm">{current.description}</p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            {(["macro", "micro", "communication"] as const).map((axis, i) => (
              <div key={axis} className="bg-white/5 border border-white/10 p-2.5 rounded-lg">
                <div className={`font-extrabold uppercase tracking-wider mb-0.5 ${["text-blue-300", "text-green-300", "text-yellow-300"][i]}`}>
                  {current[axis].title}
                </div>
                <p className="text-gray-300 leading-snug">{current[axis].description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="lg:col-span-5">
          <div className="bg-white/5 border border-white/10 p-4 rounded-xl sticky top-24">
            <h3 className="text-sm font-extrabold mb-3 uppercase tracking-widest text-gray-400">
              Choose your decision
            </h3>
            <div className="space-y-2">
              {currentOptions.map((opt) => {
                const isPicked = selected === opt.id;
                const q = qualityOf(opt);
                const qMeta = QUALITY[q];
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect(opt.id)}
                    disabled={revealed}
                    className={`w-full text-left p-3 rounded-lg border transition duration-150 text-sm ${
                      !revealed
                        ? "bg-white/5 border-white/10 hover:bg-white/15 hover:border-white/30"
                        : isPicked
                        ? `${qMeta.bg} border-transparent ring-2 ${qMeta.ring}`
                        : q === "perfect"
                        ? "bg-white/10 border-white/20 opacity-70"
                        : "bg-white/5 border-white/5 opacity-30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-semibold text-white leading-snug">{opt.text}</span>
                      {revealed && (
                        <span className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 ${qMeta.bg} ${qMeta.text}`}>
                          {qMeta.label}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {revealed && pickedQ && (
              <div className={`mt-4 p-3 rounded-lg border animate-in fade-in slide-in-from-bottom-2 ${
                timedOut ? "bg-red-900/30 border-red-500/30" : `${QUALITY[pickedQ].bg} border-white/10`
              }`}>
                {timedOut ? (
                  <div className="text-center">
                    <div className="text-2xl font-black text-red-400 mb-1">⚡ TIME&apos;S UP</div>
                    <p className="text-xs text-gray-400">Next question incoming…</p>
                  </div>
                ) : (
                  <>
                    <div className={`text-xs font-black uppercase tracking-widest mb-1 ${QUALITY[pickedQ].text}`}>
                      {QUALITY[pickedQ].label} · +{QUALITY[pickedQ].score} pts
                    </div>
                    <p className="text-gray-300 text-xs italic leading-relaxed">
                      &ldquo;{pickedOpt?.feedback}&rdquo;
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BoltSummary({
  verdicts,
  scenarios,
  eloDelta,
  onReset,
}: {
  verdicts: Verdict[];
  scenarios: Scenario[];
  eloDelta: number | null;
  onReset: () => void;
}) {
  const total = scenarios.length;
  const maxScore = total * 100;
  const score = verdicts.reduce((a, v) => a + v.score, 0);
  const pct = maxScore === 0 ? 0 : Math.round((score / maxScore) * 100);
  const timedOutCount = verdicts.filter((v) => v.timedOut).length;
  const counts = verdicts.reduce((acc, v) => {
    acc[v.quality] = (acc[v.quality] || 0) + 1;
    return acc;
  }, {} as Record<OptionQuality, number>);

  return (
    <div className="max-w-3xl mx-auto text-white">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-3xl font-extrabold">Bolt complete</h2>
      </div>
      {timedOutCount > 0 && (
        <p className="text-red-400 text-sm mb-4">{timedOutCount} question{timedOutCount > 1 ? "s" : ""} timed out 💥</p>
      )}

      {eloDelta !== null && (
        <div className={`mt-4 p-4 rounded-xl border flex items-center justify-between ${
          eloDelta > 0 ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"
        }`}>
          <div className="font-extrabold">Rating Update</div>
          <div className={`text-3xl font-black tabular-nums ${eloDelta > 0 ? "text-green-400" : "text-red-400"}`}>
            <AnimatedNumber value={eloDelta} showSign duration={1200} />
            <span className="text-lg ml-1">ELO</span>
          </div>
        </div>
      )}

      <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="flex items-baseline gap-3 mb-4">
          <AnimatedNumber value={pct} className="text-6xl font-extrabold text-primary" duration={1000} />
          <span className="text-3xl font-extrabold text-primary">%</span>
          <span className="text-gray-400 text-sm">{score} / {maxScore} pts</span>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-6">
          <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${pct}%` }} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(["perfect", "excellent", "good", "blunder"] as OptionQuality[]).map((q) => {
            const meta = QUALITY[q];
            return (
              <div key={q} className={`rounded-lg px-4 py-3 ${meta.bg} border border-white/10`}>
                <div className={`text-xs font-extrabold uppercase tracking-wider ${meta.text}`}>{meta.label}</div>
                <AnimatedNumber value={counts[q] ?? 0} className="text-3xl font-extrabold" duration={800} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-extrabold mb-3">Breakdown</h3>
        <ol className="space-y-2">
          {verdicts.map((v, i) => {
            const s = scenarios.find((x) => x.id === v.scenarioId);
            const meta = QUALITY[v.quality];
            return (
              <li key={i} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-4 py-2.5">
                <span className="text-gray-200 text-sm">
                  <span className="text-gray-500 mr-2">#{i + 1}</span>
                  {s?.title}
                </span>
                <div className="flex items-center gap-2">
                  {v.timedOut && <span className="text-xs text-red-400 font-bold">💥</span>}
                  <span className={`text-xs font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${meta.bg} ${meta.text}`}>
                    {meta.label}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-8 flex gap-3 flex-wrap">
        <button
          onClick={onReset}
          className="bg-primary hover:bg-primary/90 text-white font-extrabold px-6 py-2.5 rounded-lg transition active:scale-95"
        >
          Play again
        </button>
        <Link href="/fundamentals" className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold px-6 py-2.5 rounded-lg">
          Fundamentals
        </Link>
      </div>
    </div>
  );
}
