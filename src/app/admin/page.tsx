"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Pack = { id: string; name: string; difficulty?: string; scenarioIds?: string[] };
type User = { id: string };

export default function AdminDashboard() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [scenarioCount, setScenarioCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [packsRes, usersRes, scenRes] = await Promise.all([
        fetch("/api/packs"),
        fetch("/api/users"),
        fetch("/api/scenarios"),
      ]);
      const [packsData, usersData, scenData] = await Promise.all([
        packsRes.json(),
        usersRes.json(),
        scenRes.json(),
      ]);
      setPacks(packsData);
      setUsers(usersData);
      setScenarioCount(Array.isArray(scenData) ? scenData.length : 0);
      setLoading(false);
    };
    load();
  }, []);

  const difficultyCounts = packs.reduce<Record<string, number>>((acc, p) => {
    const d = p.difficulty ?? "intermediate";
    acc[d] = (acc[d] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-4">Admin Dashboard</h1>
      <p className="text-gray-300">
        Manage scenario packs, users, and content from here.
      </p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/packs" className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition">
          <h2 className="text-xl font-bold text-blue-400 mb-2">Packs</h2>
          <p className="text-3xl font-bold text-white">{loading ? "…" : packs.length}</p>
          <p className="text-gray-400 text-sm mt-1">
            Beginner: {difficultyCounts["beginner"] ?? 0} · Intermediate: {difficultyCounts["intermediate"] ?? 0} · Advanced: {difficultyCounts["advanced"] ?? 0}
          </p>
        </Link>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-blue-400 mb-2">Scenarios</h2>
          <p className="text-3xl font-bold text-white">{loading ? "…" : scenarioCount}</p>
          <p className="text-gray-400 text-sm mt-1">Across all packs</p>
        </div>
        <Link href="/admin/users" className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition">
          <h2 className="text-xl font-bold text-blue-400 mb-2">Users</h2>
          <p className="text-3xl font-bold text-white">{loading ? "…" : users.length}</p>
          <p className="text-gray-400 text-sm mt-1">Registered accounts</p>
        </Link>
      </div>
    </div>
  );
}
