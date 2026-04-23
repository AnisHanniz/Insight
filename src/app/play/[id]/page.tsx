"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import type { Scenario } from "@/types/scenario";
import ScenarioView from "@/components/ScenarioView";
import { THEMES } from "@/lib/themes";

export default function PlayPage() {
  const { data: session } = useSession();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [pack, setPack] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const { id: packId } = params;

  useEffect(() => {
    if (!packId) return;
    (async () => {
      const [pRes, sRes] = await Promise.all([
        fetch(`/api/packs/${packId}`),
        fetch(`/api/scenarios?packId=${packId}`),
      ]);
      setPack(await pRes.json());
      setScenarios(await sRes.json());
      setLoading(false);
    })();
  }, [packId]);

  if (loading) {
    return <div className="container mx-auto p-8 text-white">Loading...</div>;
  }

  if (!pack) {
    return <div className="container mx-auto p-8 text-white">Pack not found.</div>;
  }

  const owned = (session?.user?.packsUnlocked as string[] | undefined)?.includes(pack.id);
  const ownCreator = session?.user?.id === pack.creatorId;
  const locked = pack.isCommunity && pack.status === "approved" && !owned && !ownCreator;
  if (locked) {
    return (
      <div className="container mx-auto p-8 text-white max-w-2xl">
        <h1 className="text-3xl font-extrabold">{pack.name}</h1>
        <p className="text-gray-300 mt-3">
          Community pack — unlock to play.
        </p>
        <Link
          href={`/community/${pack.id}`}
          className="inline-block mt-6 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold px-5 py-2 rounded-lg tracking-wide"
        >
          Unlock for {pack.priceIP?.toLocaleString()} IP
        </Link>
      </div>
    );
  }

  const t = THEMES[pack.theme as keyof typeof THEMES] ?? THEMES.training;

  if (scenarios.length === 0) {
    return (
      <div className="container mx-auto px-6 py-16 text-white max-w-2xl">
        <h1 className="text-3xl font-extrabold">{pack.name}</h1>
        <p className="text-gray-300 mt-4">
          No scenarios in this pack yet. Come back soon.
        </p>
        <Link
          href={`/themes/${pack.theme}`}
          className={`inline-block mt-6 font-bold ${t.accent}`}
        >
          ← Back to {t.name}
        </Link>
      </div>
    );
  }

  return (
    <main className="text-white">
      <div className={`border-b border-white/10 bg-gradient-to-br ${t.gradient}`}>
        <div className="container mx-auto px-6 py-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs uppercase tracking-widest text-gray-300">
              {t.name}
            </div>
            <h1 className="text-2xl font-extrabold">{pack.name}</h1>
          </div>
          <Link
            href={`/packs/${pack.id}`}
            className="text-sm font-bold text-gray-300 hover:text-white"
          >
            ← Pack details
          </Link>
        </div>
      </div>
      <div className="container mx-auto px-6 py-10">
        <ScenarioView scenarios={scenarios} pack={pack} />
      </div>
    </main>
  );
}
