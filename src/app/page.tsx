import Link from "next/link";
import { THEMES, THEME_ORDER } from "@/lib/themes";
import MindMap from "@/components/MindMap";

export default function LandingPage() {
  return (
    <main className="text-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,168,232,0.25),transparent_60%)]" />
        <div className="container relative mx-auto px-6 pt-16 pb-20">
          <p className="uppercase tracking-[0.3em] text-xs text-primary mb-4">
            Counter-Strike decision trainer
          </p>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] max-w-4xl">
            Think faster. <span className="text-primary">Decide better.</span>
            <br />
            Win more rounds.
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-2xl">
            Insight trains the eight skill fundamentals that separate tier-1 players
            from the rest — from crosshair placement to clutch reads — one
            graded decision at a time.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/fundamentals"
              className="bg-primary hover:bg-dark-2 text-white font-bold px-7 py-3.5 rounded-lg shadow-lg shadow-primary/30 transition"
            >
              Start training
            </Link>
            <Link
              href="#fundamentals"
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold px-7 py-3.5 rounded-lg transition"
            >
              See the 8 fundamentals
            </Link>
          </div>
        </div>
      </section>

      {/* MARKETING SECTION: Premium Call-to-Action */}
      <section className="container mx-auto px-6 py-12">
        <div className="relative overflow-hidden bg-gradient-to-r from-primary/20 via-slate-900 to-slate-900 border border-primary/50 rounded-3xl p-10 md:p-14 flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl shadow-primary/10">
          {/* Subtle background glow effect */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary/30 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block px-3 py-1 mb-4 text-xs font-black uppercase tracking-widest bg-primary/20 text-primary border border-primary/30 rounded-full">
              Premium Unlocked
            </span>
            <h3 className="text-4xl md:text-5xl font-black leading-tight tracking-tight">
              Take your decisions <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-300">to the next level.</span>
            </h3>
            <p className="text-lg text-gray-300 mt-4 leading-relaxed font-medium">
              Access exclusive tier-1 tournament breakdowns, advanced tactical packs, and deep game-vision scenarios derived from pro comms. Stop guessing, start knowing.
            </p>
            <ul className="mt-6 space-y-3">
              <li className="flex items-center gap-3 text-sm text-gray-200">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Pro tournament decision scenarios
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-200">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Advanced macro game plans
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-200">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                +500 ELO rating potential 
              </li>
            </ul>
          </div>
          <div className="relative z-10 w-full md:w-auto flex flex-col gap-4 shrink-0">
            <Link
              href="/premium"
              className="group relative inline-flex items-center justify-center px-8 py-4 font-black text-white bg-primary hover:bg-cyan-500 rounded-xl overflow-hidden shadow-xl shadow-primary/30 transition-all active:scale-95"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></span>
              <span className="relative flex items-center gap-2">
                GET PREMIUM PACKS
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </span>
            </Link>
            <p className="text-center text-xs text-gray-500 uppercase tracking-wider font-bold">Secure Stripe checkout</p>
          </div>
        </div>
      </section>

      <section id="fundamentals" className="container mx-auto px-6 py-16">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div>
            <h2 className="text-4xl font-extrabold">The 8 fundamentals</h2>
            <p className="text-gray-400 mt-2">
              Inspired by the CS player-development map. Every pack targets one
              fundamental so you know exactly what you&apos;re training.
            </p>
          </div>
          <Link
            href="/fundamentals"
            className="text-primary hover:text-accent font-bold"
          >
            Browse all packs →
          </Link>
        </div>

        <MindMap />
      </section>

      <section className="container mx-auto px-6 pb-20 mt-12">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h3 className="text-2xl font-extrabold">
              Every decision is graded.
            </h3>
            <p className="text-gray-400 mt-2 max-w-2xl">
              FACEIT difficulty, chess.com feedback. Perfect / Excellent / Good
              / Blunder, with the reason explained every time.
            </p>
          </div>
          <Link
            href="/fundamentals"
            className="bg-primary hover:bg-dark-2 text-white font-bold px-6 py-3 rounded-lg"
          >
            Start free
          </Link>
        </div>
      </section>
    </main>
  );
}