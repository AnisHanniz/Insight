"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { THEMES } from "@/lib/themes";
import { tierForScenarioCount, MAX_ACTIVE_PACKS_PER_USER } from "@/lib/pricing";

type CommunityPack = {
  id: string;
  name: string;
  theme: string;
  status: string;
  scenarios: number;
  priceIP?: number | null;
  creatorShareIP?: number | null;
  rejectionReason?: string | null;
  createdAt: string;
};

const STATUS_BADGE: Record<string, string> = {
  draft: "bg-gray-500/20 text-gray-300",
  pending: "bg-yellow-500/20 text-yellow-300",
  approved: "bg-green-500/20 text-green-300",
  rejected: "bg-red-500/20 text-red-300",
};

export default function CreateDashboard() {
  const { status } = useSession();
  const [packs, setPacks] = useState<CommunityPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") redirect("/signin");
    if (status === "authenticated") {
      fetch("/api/community/packs")
        .then((r) => r.json())
        .then((data) => {
          setPacks(Array.isArray(data) ? data : []);
          setLoading(false);
        });
    }
  }, [status]);

  const activeCount = packs.filter((p) => p.status === "draft" || p.status === "pending").length;

  const createPack = async () => {
    if (!newName.trim()) return;
    setErr(null);
    const res = await fetch("/api/community/packs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    const data = await res.json();
    if (!res.ok) {
      setErr(data.message);
      return;
    }
    setCreating(false);
    setNewName("");
    window.location.href = `/create/${data.id}`;
  };

  if (loading) return <div className="container mx-auto p-6 text-gray-light">Loading…</div>;

  return (
    <div className="container mx-auto p-6 text-white max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Creator Studio</h1>
          <p className="text-gray-400 mt-1">
            Build community packs. Get them approved. Earn Insights on every sale.
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          disabled={activeCount >= MAX_ACTIVE_PACKS_PER_USER}
          className="bg-primary hover:bg-primary/80 px-5 py-2 rounded-lg font-bold text-sm tracking-wide disabled:opacity-50"
          title={activeCount >= MAX_ACTIVE_PACKS_PER_USER ? `Limit ${MAX_ACTIVE_PACKS_PER_USER} active` : ""}
        >
          + New pack
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6 text-sm text-gray-300">
        <div className="font-bold text-white mb-2">Pricing tiers</div>
        <div className="grid md:grid-cols-4 gap-3">
          <div><span className="text-gray-400">&lt;10 scenarios</span><br/>$1.99 → 1 000 IP for you</div>
          <div><span className="text-gray-400">10–29</span><br/>$3.99 → 2 790 IP (70%)</div>
          <div><span className="text-gray-400">30–49</span><br/>$5.99 → 4 190 IP (70%)</div>
          <div><span className="text-gray-400">≥50</span><br/>$7.99 → 5 590 IP (70%)</div>
        </div>
        <div className="mt-3 text-xs text-gray-400">
          Active slots: {activeCount} / {MAX_ACTIVE_PACKS_PER_USER}. Approved & rejected packs don&apos;t count.
        </div>
      </div>

      {creating && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6">
          <h2 className="font-bold mb-3">New pack — name it first</h2>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Retake Reads — Mirage B"
            className="w-full bg-dark-2 border border-white/10 rounded px-3 py-2 mb-3"
            autoFocus
          />
          {err && <div className="text-red-300 text-sm mb-2">{err}</div>}
          <div className="flex gap-2">
            <button onClick={createPack} className="bg-primary px-4 py-1.5 rounded text-sm font-bold">Create draft</button>
            <button onClick={() => { setCreating(false); setErr(null); }} className="bg-white/10 px-4 py-1.5 rounded text-sm">Cancel</button>
          </div>
        </div>
      )}

      {packs.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-10 text-center text-gray-400">
          No packs yet. Click <span className="text-white font-bold">+ New pack</span> to start.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {packs.map((p) => {
            const tier = tierForScenarioCount(p.scenarios);
            const themeColor = (THEMES as any)[p.theme]?.color || "#666";
            return (
              <Link
                key={p.id}
                href={`/create/${p.id}`}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 transition block"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider" style={{ color: themeColor }}>{(THEMES as any)[p.theme]?.name || p.theme}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${STATUS_BADGE[p.status] || "bg-white/10"}`}>{p.status}</span>
                </div>
                <h3 className="text-lg font-bold">{p.name}</h3>
                <div className="text-sm text-gray-400 mt-2">
                  {p.scenarios} scenario{p.scenarios !== 1 ? "s" : ""} — tier ${tier.priceUSD.toFixed(2)} ({tier.creatorShareIP.toLocaleString()} IP for you)
                </div>
                {p.rejectionReason && (
                  <div className="mt-2 text-xs text-red-300">Rejected: {p.rejectionReason}</div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
