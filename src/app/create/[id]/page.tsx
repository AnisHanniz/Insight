"use client";

import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import PackForm from "@/components/admin/PackForm";
import ScenarioForm from "@/components/admin/ScenarioForm";
import { tierForScenarioCount } from "@/lib/pricing";
import { THEMES } from "@/lib/themes";

const STATUS_BADGE: Record<string, string> = {
  draft: "bg-gray-500/20 text-gray-300",
  pending: "bg-yellow-500/20 text-yellow-300",
  approved: "bg-green-500/20 text-green-300",
  rejected: "bg-red-500/20 text-red-300",
};

export default function CreatorPackEditor({ params }: { params: { id: string } }) {
  const { status } = useSession();
  const router = useRouter();
  const [pack, setPack] = useState<any>(null);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPack, setEditingPack] = useState(false);
  const [editingScenario, setEditingScenario] = useState<any | null>(null);
  const [addingScenario, setAddingScenario] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const load = async () => {
    const res = await fetch(`/api/community/packs/${params.id}`);
    if (!res.ok) {
      if (res.status === 404 || res.status === 403) {
        router.replace("/create");
        return;
      }
      setLoading(false);
      return;
    }
    const data = await res.json();
    setPack(data);
    setScenarios(data.scenarios || []);
    setLoading(false);
  };

  useEffect(() => {
    if (status === "unauthenticated") redirect("/signin");
    if (status === "authenticated") load();
  }, [status]);

  if (loading) return <div className="container mx-auto p-6 text-gray-light">Loading…</div>;
  if (!pack) return <div className="container mx-auto p-6 text-red-300">Pack not found.</div>;

  const editable = pack.status === "draft" || pack.status === "rejected";
  const tier = tierForScenarioCount(scenarios.length);
  const themeColor = (THEMES as any)[pack.theme]?.color || "#666";

  const savePack = async (data: any) => {
    const res = await fetch(`/api/community/packs/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) { setMsg({ type: "err", text: json.message }); return; }
    setEditingPack(false);
    setMsg({ type: "ok", text: "Pack saved" });
    load();
  };

  const saveScenario = async (data: any) => {
    if (editingScenario && editingScenario.id) {
      const res = await fetch(`/api/community/scenarios/${editingScenario.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) { setMsg({ type: "err", text: json.message }); return; }
      setEditingScenario(null);
    } else {
      const res = await fetch(`/api/community/packs/${params.id}/scenarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) { setMsg({ type: "err", text: json.message }); return; }
      setAddingScenario(false);
    }
    load();
  };

  const deleteScenario = async (sid: string) => {
    if (!confirm("Delete scenario?")) return;
    const res = await fetch(`/api/community/scenarios/${sid}`, { method: "DELETE" });
    if (!res.ok) { const j = await res.json(); setMsg({ type: "err", text: j.message }); return; }
    load();
  };

  const deletePack = async () => {
    if (!confirm("Delete this pack and all its scenarios?")) return;
    const res = await fetch(`/api/community/packs/${params.id}`, { method: "DELETE" });
    if (!res.ok) { const j = await res.json(); setMsg({ type: "err", text: j.message }); return; }
    router.push("/create");
  };

  const submit = async () => {
    if (!confirm(`Submit for review? Price will be $${tier.priceUSD.toFixed(2)} (${tier.priceIP} IP, you get ${tier.creatorShareIP} IP per sale).`)) return;
    const res = await fetch(`/api/community/packs/${params.id}/submit`, { method: "POST" });
    const json = await res.json();
    if (!res.ok) { setMsg({ type: "err", text: json.message }); return; }
    setMsg({ type: "ok", text: "Submitted. A reviewer will look at it soon." });
    load();
  };

  return (
    <div className="container mx-auto p-6 text-white max-w-6xl">
      <Link href="/create" className="text-sm text-gray-400 hover:text-white">← Back to studio</Link>

      <div className="flex items-start justify-between mt-3 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs uppercase tracking-wider" style={{ color: themeColor }}>{(THEMES as any)[pack.theme]?.name || pack.theme}</span>
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${STATUS_BADGE[pack.status] || ""}`}>{pack.status}</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">{pack.name}</h1>
          {pack.subtitle && <p className="text-gray-400 mt-1">{pack.subtitle}</p>}
          {pack.rejectionReason && (
            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded text-sm text-red-300">
              <strong>Rejected:</strong> {pack.rejectionReason}
              <div className="text-xs text-red-200 mt-1">Edit scenarios/meta → save → submit again.</div>
            </div>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {editable && <button onClick={() => setEditingPack(true)} className="bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-1.5 rounded text-sm">Edit meta</button>}
          {editable && <button onClick={deletePack} className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 px-3 py-1.5 rounded text-sm">Delete</button>}
        </div>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded text-sm ${msg.type === "ok" ? "bg-green-500/10 border border-green-500/30 text-green-300" : "bg-red-500/10 border border-red-500/30 text-red-300"}`}>{msg.text}</div>
      )}

      <div className="bg-gradient-to-br from-primary/20 to-purple-900/10 border border-primary/20 rounded-xl p-5 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm text-gray-400">Current tier ({scenarios.length} scenario{scenarios.length !== 1 ? "s" : ""})</div>
            <div className="text-2xl font-black">${tier.priceUSD.toFixed(2)} <span className="text-base font-normal text-gray-400">= {tier.priceIP} IP</span></div>
            <div className="text-sm text-green-300">You earn {tier.creatorShareIP} IP per sale</div>
          </div>
          {editable && scenarios.length > 0 && (
            <button onClick={submit} className="bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold px-5 py-2.5 rounded-lg tracking-wide">Submit for review</button>
          )}
          {pack.status === "pending" && <div className="text-yellow-300 font-bold">⏳ Awaiting review</div>}
          {pack.status === "approved" && <div className="text-green-300 font-bold">✓ Live on Community</div>}
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold">Scenarios ({scenarios.length})</h2>
        {editable && <button onClick={() => setAddingScenario(true)} className="bg-primary hover:bg-primary/80 px-4 py-1.5 rounded text-sm font-bold">+ New scenario</button>}
      </div>

      {scenarios.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center text-gray-400">No scenarios yet.</div>
      ) : (
        <div className="space-y-2">
          {scenarios.map((s: any) => (
            <div key={s.id} className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between">
              <div>
                <div className="font-bold">{s.title}</div>
                <div className="text-xs text-gray-400">{s.map} · {(s.options as any[])?.length || 0} options</div>
              </div>
              {editable && (
                <div className="flex gap-2">
                  <button onClick={() => setEditingScenario(s)} className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 px-3 py-1.5 rounded text-sm">Edit</button>
                  <button onClick={() => deleteScenario(s.id)} className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 px-3 py-1.5 rounded text-sm">Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {editingPack && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1a1c23] border border-white/10 rounded-xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit pack</h2>
            <PackForm pack={pack} onSave={savePack} onCancel={() => setEditingPack(false)} />
          </div>
        </div>
      )}

      {(addingScenario || editingScenario) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1a1c23] border border-white/10 rounded-xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingScenario ? "Edit scenario" : "New scenario"}</h2>
            <ScenarioForm
              scenario={editingScenario}
              onSave={saveScenario}
              onCancel={() => { setAddingScenario(false); setEditingScenario(null); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
