"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ModerationQueue() {
  const { data: session, status } = useSession();
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [packs, setPacks] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const isAdmin = session?.user?.role === "admin";

  const load = async () => {
    setLoading(true);
    const [pk, wd] = await Promise.all([
      fetch(`/api/admin/moderation?status=${tab}`).then((r) => r.json()),
      isAdmin ? fetch("/api/admin/withdrawals?status=pending").then((r) => r.json()) : Promise.resolve([]),
    ]);
    setPacks(Array.isArray(pk) ? pk : []);
    setWithdrawals(Array.isArray(wd) ? wd : []);
    setLoading(false);
  };

  useEffect(() => {
    if (status === "unauthenticated") redirect("/signin");
    if (status === "authenticated") {
      const r = session?.user?.role;
      if (r !== "admin" && r !== "reviewer") redirect("/");
      load();
    }
  }, [status, tab]);

  const openDetails = async (packId: string) => {
    const res = await fetch(`/api/admin/moderation/${packId}`);
    if (res.ok) setSelected(await res.json());
  };

  const moderate = async (action: "approve" | "reject") => {
    if (!selected) return;
    if (action === "reject" && !rejectReason.trim()) {
      setMsg("Reason required to reject.");
      return;
    }
    const res = await fetch(`/api/admin/moderation/${selected.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reason: rejectReason }),
    });
    const data = await res.json();
    if (!res.ok) { setMsg(data.message); return; }
    setSelected(null);
    setRejectReason("");
    setMsg(`Pack ${action}d.`);
    load();
  };

  const handleWithdrawal = async (id: string, action: "paid" | "reject") => {
    const reason = action === "reject" ? prompt("Rejection reason?") : null;
    if (action === "reject" && !reason) return;
    const res = await fetch(`/api/admin/withdrawals/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reason }),
    });
    const data = await res.json();
    if (!res.ok) { setMsg(data.message); return; }
    setMsg(`Withdrawal ${action === "paid" ? "marked paid" : "rejected"}.`);
    load();
  };

  if (loading) return <div className="container mx-auto p-6 text-gray-light">Loading…</div>;

  return (
    <div className="container mx-auto p-6 text-white max-w-6xl">
      <h1 className="text-4xl font-extrabold tracking-tight mb-2">Moderation</h1>
      <p className="text-gray-400 mb-6">Review community packs. {isAdmin && "Also: handle withdrawal payouts."}</p>

      {msg && (
        <div className="mb-4 p-3 rounded bg-white/5 border border-white/10 text-sm">{msg}</div>
      )}

      <div className="flex gap-2 mb-5">
        {(["pending", "approved", "rejected"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded text-sm font-bold capitalize ${tab === t ? "bg-primary" : "bg-white/5 hover:bg-white/10"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {packs.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center text-gray-400">
          No {tab} packs.
        </div>
      ) : (
        <div className="space-y-3 mb-10">
          {packs.map((p) => (
            <div key={p.id} className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between">
              <div>
                <div className="font-bold">{p.name}</div>
                <div className="text-xs text-gray-400">
                  {p.scenarios} scenarios · by {p.creator?.name || p.creator?.email || "?"} · {p.price}
                </div>
                {p.rejectionReason && <div className="text-xs text-red-300 mt-1">Rejected: {p.rejectionReason}</div>}
              </div>
              <button onClick={() => openDetails(p.id)} className="bg-primary hover:bg-primary/80 px-4 py-1.5 rounded text-sm font-bold">Review</button>
            </div>
          ))}
        </div>
      )}

      {isAdmin && (
        <>
          <h2 className="text-2xl font-extrabold mb-3">Pending withdrawals</h2>
          {withdrawals.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center text-gray-400 text-sm">None.</div>
          ) : (
            <div className="space-y-2">
              {withdrawals.map((w) => (
                <div key={w.id} className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <div className="font-bold">{w.user?.name || w.user?.email}</div>
                    <div className="text-xs text-gray-400">{w.amountIP.toLocaleString()} IP = ${w.amountUSD.toFixed(2)} · {w.payoutMethod}</div>
                    {w.payoutDetails?.contact && <div className="text-xs text-gray-500">Contact: {w.payoutDetails.contact}</div>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleWithdrawal(w.id, "paid")} className="bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-300 px-3 py-1.5 rounded text-sm">Mark paid</button>
                    <button onClick={() => handleWithdrawal(w.id, "reject")} className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 px-3 py-1.5 rounded text-sm">Reject + refund</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1a1c23] border border-white/10 rounded-xl p-6 max-h-[90vh] overflow-y-auto w-full max-w-3xl">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-xs text-gray-400">Review · {selected.theme}</div>
                <h2 className="text-2xl font-bold">{selected.name}</h2>
                <div className="text-sm text-gray-400">
                  By {selected.creator?.name || selected.creator?.email} · {selected.scenarios?.length || 0} scenarios · {selected.price}
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            {selected.subtitle && <p className="text-gray-300 mb-2">{selected.subtitle}</p>}
            {selected.description && <p className="text-gray-400 text-sm mb-4">{selected.description}</p>}

            <div className="space-y-3 mb-4 max-h-[40vh] overflow-y-auto pr-2">
              {(selected.scenarios as any[]).map((s: any) => (
                <div key={s.id} className="bg-white/5 border border-white/10 rounded p-3">
                  <div className="font-bold text-sm">{s.title}</div>
                  <div className="text-xs text-gray-400 mb-2">{s.map}</div>
                  <p className="text-sm text-gray-300 mb-2 line-clamp-2">{s.description}</p>
                  <div className="text-xs text-gray-400">{(s.options as any[])?.length || 0} options · <Link href={`/play/${selected.id}`} target="_blank" className="text-blue-400 hover:underline">Preview pack</Link></div>
                </div>
              ))}
            </div>

            {selected.status === "pending" ? (
              <>
                <label className="block text-sm mb-1 text-gray-400">Rejection reason (if rejecting)</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={2}
                  className="w-full bg-dark-2 border border-white/10 rounded px-3 py-2 mb-3 text-sm"
                  placeholder="What must the creator fix?"
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => moderate("reject")} className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-200 px-4 py-2 rounded font-bold text-sm">Reject</button>
                  <button onClick={() => moderate("approve")} className="bg-green-500 hover:bg-green-400 text-black font-extrabold px-5 py-2 rounded text-sm tracking-wide">Approve</button>
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-400">
                Status: <span className="text-white font-bold">{selected.status}</span>
                {selected.rejectionReason && <div className="text-red-300 mt-1">{selected.rejectionReason}</div>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
