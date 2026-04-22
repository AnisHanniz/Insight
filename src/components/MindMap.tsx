"use client";

import Link from "next/link";
import { THEMES, THEME_ORDER } from "@/lib/themes";

export default function MindMap() {
  return (
    <div className="relative w-full max-w-5xl mx-auto py-12 md:py-24 flex flex-col items-center">
      {/* Central Node */}
      <div className="relative z-10 bg-slate-900 border-2 border-primary text-center px-6 py-4 rounded-2xl shadow-2xl shadow-primary/20 mb-16 md:mb-0 md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2">
        <h3 className="text-2xl font-black uppercase tracking-widest text-white">CS2 Mastery</h3>
        <p className="text-xs text-primary font-bold mt-1 uppercase tracking-widest">Player Development</p>
      </div>

      {/* SVG Connecting Lines (Visible only on md+ screens) */}
      <svg className="hidden md:block absolute inset-0 w-full h-full pointer-events-none z-0" style={{ minHeight: '600px' }}>
        {THEME_ORDER.map((slug, i) => {
          // Simple math to draw lines from center to nodes
          const angle = (i / THEME_ORDER.length) * Math.PI * 2;
          const adjustedAngle = angle - Math.PI / 2;
          const radiusX = 35; // % of width
          const radiusY = 35; // % of height
          
          const x2 = 50 + Math.cos(adjustedAngle) * radiusX;
          const y2 = 50 + Math.sin(adjustedAngle) * radiusY;

          return (
            <line
              key={slug}
              x1="50%"
              y1="50%"
              x2={`${x2}%`}
              y2={`${y2}%`}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          );
        })}
      </svg>

      {/* Nodes */}
      <div className="w-full relative z-10 grid grid-cols-1 sm:grid-cols-2 md:block md:h-[600px] gap-4">
        {THEME_ORDER.map((slug, i) => {
          const t = THEMES[slug];
          // Position nodes in a circle on desktop
          const angle = (i / THEME_ORDER.length) * Math.PI * 2;
          // Offset the starting angle slightly so they look balanced
          const adjustedAngle = angle - Math.PI / 2;
          
          const radiusX = 40; // % of width
          const radiusY = 40; // % of height
          
          const left = 50 + Math.cos(adjustedAngle) * radiusX;
          const top = 50 + Math.sin(adjustedAngle) * radiusY;

          return (
            <Link
              key={slug}
              href={`/themes/${slug}`}
              className="md:absolute md:-translate-x-1/2 md:-translate-y-1/2 flex flex-col items-center group transition-transform hover:scale-105"
              style={{
                left: `calc(${left}%)`,
                top: `calc(${top}%)`
              }}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-lg bg-gradient-to-br border border-white/20 group-hover:border-white/50 transition-colors ${t.gradient}`}>
                <span className={`w-3 h-3 rounded-full ${t.dot}`} />
              </div>
              <div className="bg-slate-900/80 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-lg text-center shadow-xl group-hover:border-white/30 transition-colors max-w-[200px]">
                <h4 className="text-sm font-extrabold text-white leading-tight">{t.name}</h4>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
