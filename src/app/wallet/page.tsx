"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

type Tx = {
  id: string;
  type: string;
  amountIP: number;
  status: string;
  packId?: string | null;
  createdAt: string;
};

type Withdrawal = {
  id: string;
  amountIP: number;
  amountUSD: number;
  status: string;
  createdAt: string;
};

export default function WalletPage() {
  const { data: session, status, update } = useSession();
  const [balance, setBalance] = useState<number>(0);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [topupUSD, setTopupUSD] = useState(5);
  const [wdAmount, setWdAmount] = useState(5000);
  const [wdMethod, setWdMethod] = useState("paypal");
  const [wdDetails, setWdDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const load = async () => {
    const res = await fetch("/api/wallet");
    if (res.ok) {
      const data = await res.json();
      setBalance(data.balance);
      setTxs(data.transactions);
      setWithdrawals(data.withdrawals);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (status === "unauthenticated") redirect("/signin");
    if (status === "authenticated") load();
  }, [status]);

  const handleTopup = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/wallet/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountUSD: topupUSD }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setBalance(data.balance);
      await update({ ...session, user: { ...session?.user, balance: data.balance } });
      setMsg({ type: "ok", text: `Credited ${data.credited} IP (stub, TODO Stripe)` });
      load();
    } catch (e: any) {
      setMsg({ type: "err", text: e.message });
    }
    setBusy(false);
  };

  const handleWithdraw = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountIP: wdAmount,
          payoutMethod: wdMethod,
          payoutDetails: { contact: wdDetails },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setBalance(data.balance);
      await update({ ...session, user: { ...session?.user, balance: data.balance } });
      setMsg({ type: "ok", text: "Withdrawal submitted. Admin will review." });
      load();
    } catch (e: any) {
      setMsg({ type: "err", text: e.message });
    }
    setBusy(false);
  };

  if (loading) return <div className="container mx-auto p-6 text-gray-light">Loading wallet…</div>;

  return (
    <div className="container mx-auto p-6 text-white max-w-5xl">
      <h1 className="text-4xl font-extrabold tracking-tight mb-2">Wallet</h1>
      <p className="text-gray-400 mb-8">
        1 000 IP = $1. Min withdrawal: 5 000 IP ($5).
      </p>

      <div className="bg-gradient-to-br from-primary/30 to-purple-900/20 border border-primary/30 rounded-xl p-6 mb-8">
        <div className="text-sm uppercase tracking-widest text-gray-300">Balance</div>
        <div className="text-5xl font-black mt-2">{balance.toLocaleString("en-US")} <span className="text-2xl text-gray-400">IP</span></div>
        <div className="text-gray-400 mt-1">≈ ${(balance / 1000).toFixed(2)}</div>
      </div>

      {msg && (
        <div className={`mb-6 p-3 rounded-lg text-sm ${msg.type === "ok" ? "bg-green-500/10 border border-green-500/30 text-green-300" : "bg-red-500/10 border border-red-500/30 text-red-300"}`}>
          {msg.text}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-1">Top up</h2>
          <p className="text-sm text-gray-400 mb-4">Convert USD to IP (1 000 IP per $).</p>
          <label className="block text-sm mb-2">Amount USD</label>
          <input
            type="number"
            min={1}
            max={500}
            value={topupUSD}
            onChange={(e) => setTopupUSD(Number(e.target.value))}
            className="w-full bg-dark-2 border border-white/10 rounded px-3 py-2 mb-3"
          />
          <div className="text-sm text-gray-400 mb-4">
            You receive: <span className="text-white font-bold">{(topupUSD * 1000).toLocaleString("en-US")} IP</span>
          </div>
          <button
            onClick={handleTopup}
            disabled={busy}
            className="w-full bg-primary hover:bg-dark-2 py-2 rounded-lg font-bold text-sm tracking-wide disabled:opacity-50"
          >
            {busy ? "Processing…" : "Top up (Stripe TODO)"}
          </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-1">Withdraw</h2>
          <p className="text-sm text-gray-400 mb-4">Min 5 000 IP ($5). Reviewed manually.</p>
          <label className="block text-sm mb-2">Amount IP</label>
          <input
            type="number"
            min={5000}
            step={1000}
            value={wdAmount}
            onChange={(e) => setWdAmount(Number(e.target.value))}
            className="w-full bg-dark-2 border border-white/10 rounded px-3 py-2 mb-3"
          />
          <label className="block text-sm mb-2">Payout method</label>
          <select
            value={wdMethod}
            onChange={(e) => setWdMethod(e.target.value)}
            className="w-full bg-dark-2 border border-white/10 rounded px-3 py-2 mb-3"
          >
            <option value="paypal">PayPal</option>
            <option value="bank">Bank transfer</option>
            <option value="crypto">Crypto</option>
          </select>
          <label className="block text-sm mb-2">Contact / address</label>
          <input
            value={wdDetails}
            onChange={(e) => setWdDetails(e.target.value)}
            placeholder="email / IBAN / wallet"
            className="w-full bg-dark-2 border border-white/10 rounded px-3 py-2 mb-3"
          />
          <div className="text-sm text-gray-400 mb-4">
            You receive ≈ <span className="text-white font-bold">${(wdAmount / 1000).toFixed(2)}</span>
          </div>
          <button
            onClick={handleWithdraw}
            disabled={busy || wdAmount < 5000 || balance < wdAmount || !wdDetails}
            className="w-full bg-white/10 hover:bg-white/20 border border-white/10 py-2 rounded-lg font-bold text-sm tracking-wide disabled:opacity-50"
          >
            {busy ? "Processing…" : "Request withdrawal"}
          </button>
        </div>
      </div>

      {withdrawals.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">Withdrawals</h2>
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-gray-400">
                <tr>
                  <th className="text-left px-4 py-2">Date</th>
                  <th className="text-left px-4 py-2">Amount</th>
                  <th className="text-left px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w) => (
                  <tr key={w.id} className="border-t border-white/5">
                    <td className="px-4 py-2">{new Date(w.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-2">{w.amountIP.toLocaleString()} IP (${w.amountUSD.toFixed(2)})</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        w.status === "paid" ? "bg-green-500/20 text-green-300" :
                        w.status === "rejected" ? "bg-red-500/20 text-red-300" :
                        "bg-yellow-500/20 text-yellow-300"
                      }`}>{w.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <h2 className="text-xl font-bold mb-3">Transaction history</h2>
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        {txs.length === 0 ? (
          <div className="p-6 text-gray-400 text-sm">No transactions yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-gray-400">
              <tr>
                <th className="text-left px-4 py-2">Date</th>
                <th className="text-left px-4 py-2">Type</th>
                <th className="text-right px-4 py-2">Amount</th>
                <th className="text-left px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {txs.map((t) => (
                <tr key={t.id} className="border-t border-white/5">
                  <td className="px-4 py-2 text-gray-300">{new Date(t.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-2 capitalize">{t.type}</td>
                  <td className={`px-4 py-2 text-right font-mono ${t.amountIP >= 0 ? "text-green-300" : "text-red-300"}`}>
                    {t.amountIP >= 0 ? "+" : ""}{t.amountIP.toLocaleString()} IP
                  </td>
                  <td className="px-4 py-2 text-gray-400">{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
