"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import type { Scenario, OptionQuality } from "@/types/scenario";
import type { Pack } from "@/types/pack";
import { QUALITY, qualityOf } from "@/lib/themes";
import MapOverlayRenderer from "@/components/MapOverlayRenderer";
import AnimatedNumber from "@/components/AnimatedNumber";

type Verdict = { scenarioId: string; quality: OptionQuality; score: number };

export default function ScenarioView({ scenarios, pack }: { scenarios: Scenario[]; pack: Pack }) {
  const { data: session } = useSession();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [verdicts, setVerdicts] = useState<Verdict[]>([]);
  const [eloDelta, setEloDelta] = useState<number | null>(null);

  const current = scenarios[index];
  const total = scenarios.length;
  const done = index >= total;

  const maxScore = total * 100;
  const score = useMemo(
    () => verdicts.reduce((a, v) => a + v.score, 0),
    [verdicts]
  );

  const currentOptions = useMemo(() => {
    if (!current) return [];
    // Randomize the options so the correct answer isn't always in the same place
    const shuffled = [...current.options];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [current?.id]);

  useEffect(() => {
    if (done && session?.user?.id) {
      const scorePct = maxScore === 0 ? 0 : Math.round((score / maxScore) * 100);
      const qualities = verdicts.reduce<Record<string, number>>((acc, v) => {
        acc[v.quality] = (acc[v.quality] ?? 0) + 1;
        return acc;
      }, {});
      fetch(`/api/users/${session.user.id}/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packId: pack.id,
          scorePct,
          difficulty: pack.difficulty || "intermediate",
          qualities,
        }),
      }).then(r => r.json()).then(data => {
        if (data.delta !== undefined) setEloDelta(data.delta);
      }).catch(console.error);
    }
  }, [done, session, maxScore, score, pack, verdicts]);

  if (done || !current) {
    return <Summary verdicts={verdicts} scenarios={scenarios} score={score} maxScore={maxScore} eloDelta={eloDelta} />;
  }

  const pickedOption = selected != null ? current.options.find((o) => o.id === selected) : null;
  const pickedQuality = pickedOption ? qualityOf(pickedOption) : null;

  function handleSelect(optId: number) {
    if (selected != null) return;
    setSelected(optId);
    const opt = current.options.find((o) => o.id === optId);
    if (!opt) return;
    const q = qualityOf(opt);
    setVerdicts((v) => [...v, { scenarioId: current.id, quality: q, score: QUALITY[q].score }]);
    try {
      const sound = q === "blunder" ? "/sounds/incorrect.mp3" : "/sounds/correct.mp3";
      new Audio(sound).play().catch(() => {});
    } catch {}
  }

  function next() {
    setSelected(null);
    setIndex((i) => i + 1);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-xs uppercase tracking-widest text-gray-400">
            Scenario {index + 1} / {total}
            {current.subcategory && (
              <span className="ml-3 text-primary">{current.subcategory}</span>
            )}
          </div>
          <h2 className="text-3xl font-extrabold mt-1">{current.title}</h2>
          {current.map && (
            <div className="text-sm text-gray-400 mt-1">Map: {current.map}</div>
          )}
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-widest text-gray-400">Score</div>
          <div className="text-3xl font-extrabold text-primary">{score}<span className="text-base text-gray-500">/{maxScore}</span></div>
        </div>
      </div>

      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${((index) / total) * 100}%` }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left/Main Column: Image & Description */}
        <div className="lg:col-span-7 space-y-6">
          {current.video ? (
            <div className="w-full rounded-xl overflow-hidden shadow-2xl bg-black aspect-video border border-white/10">
              {current.video.includes("youtu") ? (
                <iframe
                  src={`https://www.youtube.com/embed/${current.video.match(/(?:youtu\.be\/|v=)([^&]+)/)?.[1]}`}
                  className="w-full h-full"
                  allowFullScreen
                ></iframe>
              ) : (
                <video src={current.video} controls className="w-full h-full object-cover" />
              )}
            </div>
          ) : (
            <div className="relative w-full rounded-xl overflow-hidden shadow-2xl bg-slate-900 border border-white/10 min-h-[300px] flex items-center justify-center">
              {current.image && current.image.startsWith("/") && !current.image.includes("default_png") ? (
                <div className="relative mx-auto bg-slate-900 overflow-hidden" style={{ aspectRatio: "1 / 1", width: "100%", maxWidth: "min(70vh, 100%)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={current.image}
                    alt={current.title}
                    draggable={false}
                    className="w-full h-full object-contain pointer-events-none"
                  />
                  <MapOverlayRenderer overlay={current.overlay} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                   <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                   </div>
                   <div>
                     <p className="text-xl font-black italic tracking-tighter text-white/40 uppercase">Insight Intelligence</p>
                     <p className="text-xs text-primary/60 font-bold uppercase tracking-widest mt-1">Strategic Map Data • CS2 Protocol</p>
                   </div>
                </div>
              )}
            </div>
          )}

          <div className="bg-white/5 border border-white/10 p-6 rounded-xl">
             <p className="text-xl text-gray-100 leading-relaxed font-medium">{current.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <HintCard tone="text-blue-300" title={current.macro.title} body={current.macro.description} />
            <HintCard tone="text-green-300" title={current.micro.title} body={current.micro.description} />
            <HintCard tone="text-yellow-300" title={current.communication.title} body={current.communication.description} />
          </div>
        </div>

        {/* Right Column: Choices */}
        <div className="lg:col-span-5">
          <div className="bg-white/5 border border-white/10 p-6 rounded-xl sticky top-24">
            <h3 className="text-lg font-extrabold mb-4 flex items-center gap-2">
               <span className="w-1.5 h-6 bg-primary rounded-full" />
               Select the best decision
            </h3>
            <div className="space-y-3">
              {currentOptions.map((opt) => {
                const isPicked = selected === opt.id;
                const q = qualityOf(opt);
                const revealed = selected != null;
                const qMeta = QUALITY[q];
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect(opt.id)}
                    disabled={revealed}
                    className={`w-full text-left p-4 rounded-lg border transition duration-200 ${
                      !revealed
                        ? "bg-white/5 border-white/10 hover:bg-white/15 hover:border-white/30 hover:translate-x-1"
                        : isPicked
                        ? `${qMeta.bg} border-transparent ring-2 ${qMeta.ring}`
                        : "bg-white/5 border-white/10 opacity-40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span className="font-bold text-white leading-snug">{opt.text}</span>
                      {revealed && (
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded ${qMeta.bg} ${qMeta.text} shrink-0 whitespace-nowrap`}
                        >
                          {qMeta.label}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {pickedOption && pickedQuality && (
              <div className="mt-6 p-5 rounded-lg bg-secondary/80 border border-white/10 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`h-3 w-3 rounded-full ${QUALITY[pickedQuality].ring.replace("ring-", "bg-")}`} />
                  <span className={`text-sm font-black uppercase tracking-widest ${QUALITY[pickedQuality].text}`}>
                    {QUALITY[pickedQuality].label} • +{QUALITY[pickedQuality].score} PTS
                  </span>
                </div>
                <p className="text-gray-300 leading-relaxed text-sm italic">&ldquo;{pickedOption.feedback}&rdquo;</p>
                <button
                  onClick={next}
                  className="mt-6 w-full bg-primary hover:bg-dark-2 text-white font-black py-4 rounded-lg transition shadow-lg shadow-primary/20 active:scale-95"
                >
                  {index < total - 1 ? "NEXT SCENARIO →" : "SEE FINAL BILAN"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

function HintCard({ tone, title, body }: { tone: string; title: string; body: string }) {
  return (
    <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
      <h4 className={`text-sm font-extrabold uppercase tracking-wider ${tone} mb-1`}>{title}</h4>
      <p className="text-gray-200 text-sm leading-relaxed">{body}</p>
    </div>
  );
}

function Summary({
  verdicts,
  scenarios,
  score,
  maxScore,
  eloDelta,
}: {
  verdicts: Verdict[];
  scenarios: Scenario[];
  score: number;
  maxScore: number;
  eloDelta: number | null;
}) {
  const pct = maxScore === 0 ? 0 : Math.round((score / maxScore) * 100);
  const counts = verdicts.reduce(
    (acc, v) => {
      acc[v.quality] = (acc[v.quality] || 0) + 1;
      return acc;
    },
    {} as Record<OptionQuality, number>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-4xl font-extrabold">Pack complete</h2>
      <p className="text-gray-400 mt-2">Here&apos;s how you decided.</p>

      {eloDelta !== null && (
        <div className={`mt-6 p-4 rounded-xl border flex items-center justify-between ${eloDelta > 0 ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}`}>
          <div className="font-extrabold text-lg">Rating Update</div>
          <div className={`text-3xl font-black tabular-nums ${eloDelta > 0 ? "text-green-400" : "text-red-400"}`}>
            <AnimatedNumber value={eloDelta} showSign duration={1200} />
            <span className="text-lg ml-1">ELO</span>
          </div>
        </div>
      )}

      <div className="mt-8 bg-white/5 border border-white/10 rounded-xl p-8">
        <div className="flex items-baseline gap-3">
          <AnimatedNumber value={pct} className="text-6xl font-extrabold text-primary" duration={1000} />
          <span className="text-3xl font-extrabold text-primary">%</span>
          <span className="text-gray-400">
            {score} / {maxScore} points
          </span>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full mt-4 overflow-hidden">
          <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
          {(["perfect", "excellent", "good", "blunder"] as OptionQuality[]).map((q) => {
            const meta = QUALITY[q];
            return (
              <div
                key={q}
                className={`rounded-lg px-4 py-3 ${meta.bg} border border-white/10`}
              >
                <div className={`text-xs font-extrabold uppercase tracking-wider ${meta.text}`}>
                  {meta.label}
                </div>
                <AnimatedNumber value={counts[q] ?? 0} className="text-3xl font-extrabold" duration={800} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-10">
        <h3 className="text-xl font-extrabold mb-4">Scenario breakdown</h3>
        <ol className="space-y-2">
          {verdicts.map((v, i) => {
            const s = scenarios.find((x) => x.id === v.scenarioId);
            const meta = QUALITY[v.quality];
            return (
              <li
                key={i}
                className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-4 py-3"
              >
                <span className="text-gray-200">
                  <span className="text-gray-500 mr-2">#{i + 1}</span>
                  {s?.title}
                </span>
                <span className={`text-xs font-extrabold uppercase tracking-wider px-2 py-1 rounded ${meta.bg} ${meta.text}`}>
                  {meta.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-10 flex gap-3">
        <Link
          href="/fundamentals"
          className="bg-primary hover:bg-dark-2 text-white font-extrabold px-6 py-3 rounded-lg"
        >
          More packs
        </Link>
        <Link
          href="/"
          className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-extrabold px-6 py-3 rounded-lg"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
