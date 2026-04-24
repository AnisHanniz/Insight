"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { THEMES } from "@/lib/themes";

type CommunityPack = {
  id: string;
  name: string;
  theme: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  scenarios: number;
  priceIP?: number | null;
  price: string;
  creator?: {
    id: string;
    name?: string | null;
    image?: string | null;
    creatorBadge?: boolean;
  } | null;
};

export default function CommunityBrowse() {
  const [packs, setPacks] = useState<CommunityPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch("/api/community/browse")
      .then((r) => r.json())
      .then((data) => {
        setPacks(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  const filtered = packs.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="container mx-auto p-6 text-white max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight">Community Packs</h1>
        <p className="text-gray-400 mt-2">
          Packs built by the community, reviewed by our team. Unlock with Insights (IP).
        </p>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by name"
        className="w-full md:w-80 bg-dark-2 border border-white/10 rounded px-3 py-2 mb-6"
      />

      {loading ? (
        <div className="text-gray-400">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-10 text-center text-gray-400">
          No community packs yet. <Link href="/create" className="text-primary underline">Be the first to build one.</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const themeColor = (THEMES as any)[p.theme]?.color || "#666";
            return (
              <Link
                key={p.id}
                href={`/community/${p.id}`}
                className="group bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl overflow-hidden transition block"
              >
                <div
                  className="h-32 bg-cover bg-center bg-no-repeat relative"
                  style={{
                    backgroundImage: p.imageUrl ? `url(${p.imageUrl})` : undefined,
                    backgroundColor: p.imageUrl ? undefined : themeColor + "22",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute top-3 left-3 text-xs uppercase tracking-wider px-2 py-0.5 rounded bg-black/50" style={{ color: themeColor }}>
                    {(THEMES as any)[p.theme]?.name || p.theme}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-1">{p.name}</h3>
                  {p.subtitle && <p className="text-xs text-gray-400 mb-2 line-clamp-2">{p.subtitle}</p>}
                  <div className="flex items-center justify-between text-sm mt-3">
                    <div className="text-gray-400">
                      {p.creator?.name || "Anonymous"}
                      {p.creator?.creatorBadge && <span className="ml-1 text-yellow-400" title="Verified creator">★</span>}
                    </div>
                    <div className="font-bold text-primary">{p.priceIP?.toLocaleString() || 0} IP</div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{p.scenarios} scenarios · {p.price}</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
