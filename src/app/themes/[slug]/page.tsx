import Link from "next/link";
import fs from "fs/promises";
import path from "path";
import { notFound } from "next/navigation";
import type { Pack, Theme } from "@/types/pack";
import { THEMES, THEME_ORDER } from "@/lib/themes";

async function readPacks(): Promise<Pack[]> {
  const p = path.join(process.cwd(), "public", "data", "packs.json");
  return JSON.parse(await fs.readFile(p, "utf-8"));
}

export function generateStaticParams() {
  return THEME_ORDER.map((slug) => ({ slug }));
}

export default async function ThemePage({
  params,
}: {
  params: { slug: string };
}) {
  const slug = params.slug as Theme;
  const t = THEMES[slug];
  if (!t) notFound();

  const packs = (await readPacks()).filter((p) => p.theme === slug);

  return (
    <main className="text-white">
      <section
        className={`relative overflow-hidden border-b border-white/10 bg-gradient-to-br ${t.gradient}`}
      >
        <div className="container mx-auto px-6 py-16">
          <Link
            href="/"
            className="text-sm text-gray-300 hover:text-white flex items-center gap-1"
          >
            ← All fundamentals
          </Link>
          <div className="flex items-center gap-3 mt-6">
            <span className={`h-3 w-3 rounded-full ${t.dot}`} />
            <span className={`uppercase tracking-[0.3em] text-xs ${t.accent}`}>
              Fundamental
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mt-3">{t.name}</h1>
          <p className="text-xl text-gray-200 mt-4 max-w-3xl">{t.tagline}</p>
          <p className="text-gray-400 mt-6 max-w-3xl">{t.description}</p>

          <div className="mt-8 flex flex-wrap gap-2">
            {t.subcategories.map((s) => (
              <span
                key={s}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full ${t.badge}`}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-12">
        <h2 className="text-2xl font-extrabold mb-6">
          Packs in this fundamental{" "}
          <span className="text-gray-500 font-normal">({packs.length})</span>
        </h2>
        {packs.length === 0 ? (
          <p className="text-gray-400">
            No packs yet for this fundamental. Check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {packs.map((p) => (
              <Link
                key={p.id}
                href={`/packs/${p.id}`}
                className="group bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-6 transition"
              >
                <div className="flex items-center justify-between mb-3">
                  {p.difficulty && (
                    <span className={`text-xs font-bold px-2.5 py-1 rounded ${t.badge} capitalize`}>
                      {p.difficulty}
                    </span>
                  )}
                  <span className="text-sm font-bold text-gray-400">
                    {p.price}
                  </span>
                </div>
                <h3 className="text-2xl font-extrabold leading-tight">
                  {p.name}
                </h3>
                {p.subtitle && (
                  <p className="text-gray-300 mt-2">{p.subtitle}</p>
                )}
                <div className="flex items-center gap-4 mt-5 text-sm text-gray-400">
                  <span>{p.scenarios} scenarios</span>
                  {p.difficulty && (
                    <span className="capitalize">{p.difficulty}</span>
                  )}
                </div>
                <div
                  className={`mt-5 font-bold ${t.accent} opacity-0 group-hover:opacity-100 transition`}
                >
                  Open →
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
