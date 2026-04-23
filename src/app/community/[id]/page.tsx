"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { THEMES } from "@/lib/themes";

export default function CommunityPackDetail({ params }: { params: { id: string } }) {
  const { data: session, update, status: sessionStatus } = useSession();
  const router = useRouter();
  const [pack, setPack] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const load = async () => {
    const res = await fetch(`/api/packs/${params.id}`);
    if (!res.ok) { setLoading(false); return; }
    const data = await res.json();
    setPack(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [params.id]);

  if (loading) return <div className="container mx-auto p-6 text-gray-light">Loading…</div>;
  if (!pack || !pack.isCommunity || pack.status !== "approved") {
    return (
      <div className="container mx-auto p-6 text-white">
        <h1 className="text-2xl font-bold">Pack not found</h1>
        <Link href="/community" className="text-primary underline mt-2 inline-block">← Back to community</Link>
      </div>
    );
  }

  const themeColor = (THEMES as any)[pack.theme]?.color || "#666";
  const owned = (session?.user?.packsUnlocked as string[] | undefined)?.includes(pack.id);
  const ownPack = session?.user?.id === pack.creatorId;
  const balance = session?.user?.balance ?? 0;
  const canAfford = balance >= (pack.priceIP || 0);

  const purchase = async () => {
    if (sessionStatus !== "authenticated") { router.push("/signin"); return; }
    if (!confirm(`Spend ${pack.priceIP?.toLocaleString()} IP to unlock "${pack.name}"?`)) return;
    setBusy(true);
    setMsg(null);
    const res = await fetch(`/api/community/packs/${pack.id}/purchase`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) { setMsg({ type: "err", text: data.message }); setBusy(false); return; }
    await update({
      ...session,
      user: {
        ...session?.user,
        balance: balance - (pack.priceIP || 0),
        packsUnlocked: [...(session?.user?.packsUnlocked || []), pack.id],
      },
    });
    setMsg({ type: "ok", text: "Unlocked! Redirecting…" });
    setTimeout(() => router.push(`/play/${pack.id}`), 900);
  };

  return (
    <div className="container mx-auto p-6 text-white max-w-4xl">
      <Link href="/community" className="text-sm text-gray-400 hover:text-white">← Back to community</Link>

      <div className="mt-3 mb-6">
        <div className="text-xs uppercase tracking-wider mb-1" style={{ color: themeColor }}>
          {(THEMES as any)[pack.theme]?.name || pack.theme}
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">{pack.name}</h1>
        {pack.subtitle && <p className="text-gray-400 mt-2 text-lg">{pack.subtitle}</p>}
        {pack.creator && (
          <div className="mt-3 text-sm text-gray-300">
            Made by <span className="font-bold text-white">{pack.creator.name || "Anonymous"}</span>
            {pack.creator.creatorBadge && <span className="ml-1 text-yellow-400" title="Verified creator">★</span>}
          </div>
        )}
      </div>

      {pack.imageUrl && (
        <div
          className="h-56 rounded-xl bg-cover bg-center mb-6 border border-white/10"
          style={{ backgroundImage: `url(${pack.imageUrl})` }}
        />
      )}

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="text-xs text-gray-400">Scenarios</div>
          <div className="text-2xl font-extrabold">{pack.scenarioIds?.length || 0}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="text-xs text-gray-400">Price</div>
          <div className="text-2xl font-extrabold text-primary">{pack.priceIP?.toLocaleString()} IP</div>
          <div className="text-xs text-gray-500">{pack.price}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="text-xs text-gray-400">Difficulty</div>
          <div className="text-2xl font-extrabold capitalize">{pack.difficulty}</div>
        </div>
      </div>

      {pack.description && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-5 mb-6">
          <h2 className="font-bold mb-2">About</h2>
          <p className="text-gray-300 whitespace-pre-wrap">{pack.description}</p>
        </div>
      )}

      {msg && (
        <div className={`mb-4 p-3 rounded text-sm ${msg.type === "ok" ? "bg-green-500/10 border border-green-500/30 text-green-300" : "bg-red-500/10 border border-red-500/30 text-red-300"}`}>{msg.text}</div>
      )}

      <div className="sticky bottom-4 bg-[#1a1c23]/90 backdrop-blur border border-white/10 rounded-xl p-4 flex items-center justify-between">
        {owned ? (
          <>
            <div className="text-green-300 font-bold">✓ You own this pack</div>
            <Link href={`/play/${pack.id}`} className="bg-primary hover:bg-primary/80 px-5 py-2 rounded-lg font-bold text-sm tracking-wide">Play now</Link>
          </>
        ) : ownPack ? (
          <>
            <div className="text-gray-400 text-sm">This is your pack.</div>
            <Link href={`/create/${pack.id}`} className="bg-white/10 hover:bg-white/20 px-5 py-2 rounded-lg font-bold text-sm">Manage</Link>
          </>
        ) : (
          <>
            <div className="text-sm text-gray-300">
              Balance: <span className="font-bold text-white">{balance.toLocaleString()} IP</span>
              {!canAfford && <span className="block text-xs text-red-300 mt-0.5">Need {(pack.priceIP || 0) - balance} more IP — <Link href="/wallet" className="underline">top up</Link></span>}
            </div>
            <button
              onClick={purchase}
              disabled={busy || !canAfford}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold px-5 py-2.5 rounded-lg tracking-wide disabled:opacity-50 disabled:hover:bg-yellow-500"
            >
              {busy ? "Processing…" : `Unlock for ${pack.priceIP?.toLocaleString()} IP`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
