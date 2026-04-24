import Link from "next/link";
import { THEMES, THEME_ORDER } from "@/lib/themes";
import MindMap from "@/components/MindMap";

export default function LandingPage() {
  return (
    <main className="text-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,168,232,0.25),transparent_60%)]" />
        <div className="container relative mx-auto px-6 pt-10 pb-10">
          <p className="uppercase tracking-[0.3em] text-xs text-primary mb-3">
            Counter-Strike decision trainer
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.05] max-w-3xl">
            Think faster. <span className="text-primary">Decide better.</span>{" "}
            Win more rounds.
          </h1>
          <p className="mt-3 text-base text-gray-300 max-w-xl">
            Insight trains the eight skill fundamentals that separate tier-1 players
            from the rest — one graded decision at a time.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/fundamentals"
              className="bg-primary hover:bg-dark-2 text-white font-bold px-6 py-2.5 rounded-lg shadow-lg shadow-primary/30 transition text-sm"
            >
              Start training
            </Link>
            <Link
              href="/premium"
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold px-6 py-2.5 rounded-lg transition text-sm"
            >
              Get premium packs
            </Link>
          </div>
        </div>
      </section>

      <section id="fundamentals" className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-extrabold">The 8 fundamentals</h2>
            <p className="text-gray-400 mt-1 text-sm">
              Every pack targets one fundamental so you know exactly what you&apos;re training.
            </p>
          </div>
          <Link
            href="/fundamentals"
            className="text-primary hover:text-accent font-bold text-sm"
          >
            Browse all packs →
          </Link>
        </div>

        <MindMap />
      </section>

      <section className="container mx-auto px-6 pb-10">
        <div className="bg-gradient-to-r from-primary/15 via-slate-900 to-slate-900 border border-primary/40 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h3 className="text-xl font-extrabold">Every decision is graded.</h3>
            <p className="text-gray-400 mt-1 text-sm max-w-xl">
              Adaptive difficulty, chess.com feedback. Perfect / Excellent / Good / Blunder — with the reason explained every time.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link
              href="/fundamentals"
              className="bg-primary hover:bg-dark-2 text-white font-bold px-5 py-2.5 rounded-lg text-sm"
            >
              Start free
            </Link>
            <Link
              href="/premium"
              className="bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/40 text-yellow-300 font-bold px-5 py-2.5 rounded-lg text-sm"
            >
              Get Premium
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}