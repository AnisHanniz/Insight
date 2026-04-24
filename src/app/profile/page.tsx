"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/signin");
    }
    if (status === "authenticated" && session?.user) {
      fetch('/api/users')
        .then(res => res.json())
        .then(users => {
          const currentUser = users.find((u: any) => 
            session.user.id ? u.id === session.user.id : u.email === session.user.email
          );
          setUser(currentUser);
          setNewName(currentUser?.name || "");
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status, session]);

  const handleNameSave = async () => {
    const targetId = session?.user?.id || user?.id;
    if (!newName.trim() || !targetId) return;
    setSavingName(true);
    try {
      const res = await fetch(`/api/users/${targetId}/name`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser({ ...user, name: data.name });
        await update({ ...session, user: { ...session?.user, name: data.name } });
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingName(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetId = session?.user?.id || user?.id;
    if (!file || !targetId) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await fetch(`/api/users/${targetId}/avatar`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.imageUrl) {
        setUser({ ...user, image: data.imageUrl });
        await update({ ...session, user: { ...session?.user, image: data.imageUrl } });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  if (status === "loading" || loading) {
    return <div className="container mx-auto p-8 text-white">Loading profile...</div>;
  }

  if (!user) {
    return <div className="container mx-auto p-8 text-white">Failed to load profile.</div>;
  }

  const eloLevel = Math.max(1, Math.min(10, Math.floor((user.elo || 1000) / 150) - 5)); 
  const levelColor = eloLevel >= 8 ? 'bg-orange-500' : eloLevel >= 5 ? 'bg-yellow-500' : 'bg-gray-400';

  return (
    <main className="min-h-screen text-white pt-10 pb-20">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="relative rounded-2xl overflow-hidden mb-10 border border-white/5 bg-[#1a1c23]">
          <div className="h-48 bg-gradient-to-r from-blue-900/40 to-purple-900/40 relative">
            <div className="absolute inset-0 bg-[url('/images/packs/pgl-major-2025.jpg')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
          </div>
          <div className="px-8 pb-8 pt-4 flex flex-col md:flex-row items-center md:items-end gap-6 -mt-20 relative z-10">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-[#1a1c23] bg-gray-800">
                {user.image || session?.user?.image ? (
                  <Image src={user.image || session?.user?.image} alt="Avatar" width={144} height={144} className="w-full h-full object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold bg-gradient-to-br from-gray-700 to-gray-900">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center border-4 border-transparent">
                <span className="text-xs font-bold uppercase tracking-wider">{uploading ? 'Uploading...' : 'Change'}</span>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={uploading} />
            </div>

            <div className="flex-1 text-center md:text-left mb-2">
              <div className="flex items-center justify-center md:justify-start gap-3">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="bg-black/50 border border-white/20 text-white px-3 py-1 rounded-lg text-2xl font-extrabold focus:outline-none focus:border-primary max-w-[200px]"
                      autoFocus
                    />
                    <button onClick={handleNameSave} disabled={savingName} className="text-green-500 hover:text-green-400 text-sm font-bold">
                      {savingName ? "Saving..." : "Save"}
                    </button>
                    <button onClick={() => { setIsEditing(false); setNewName(user.name); }} className="text-gray-400 hover:text-gray-300 text-sm font-bold">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-extrabold flex items-center gap-2">
                      {user.name}
                      {user.creatorBadge && (
                        <span className="text-yellow-400 text-2xl" title="Verified Creator">★</span>
                      )}
                    </h1>
                    <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-white transition" aria-label="Edit Profile">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
              <p className="text-gray-400 text-sm mt-1">
                {user.role === 'admin' ? 'Administrator' : user.role === 'reviewer' ? 'Reviewer' : 'Player'}
                {user.creatorBadge && <span className="ml-2 text-yellow-300 font-bold">· Verified Creator</span>}
              </p>
            </div>

            <div className="flex items-center gap-4 mb-2">
              <div className="text-center bg-black/40 px-6 py-3 rounded-xl border border-white/5">
                <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Insight Level</div>
                <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-xl font-black ${levelColor} text-white shadow-lg`}>
                  {eloLevel}
                </div>
              </div>
              <div className="text-center bg-black/40 px-6 py-3 rounded-xl border border-white/5">
                <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Current ELO</div>
                <div className="text-3xl font-extrabold text-white">{user.elo || 1000}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span className="h-4 w-1 bg-primary rounded-full"></span>
              Recent Matches (Packs)
            </h2>
            {(!user.history || user.history.length === 0) ? (
              <div className="bg-[#1a1c23] border border-white/5 rounded-xl p-8 text-center text-gray-400">
                No packs played yet. Head over to the Packs section to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {[...user.history].reverse().map((h: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-[#1a1c23] border border-white/5 rounded-xl p-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded bg-black/50 flex items-center justify-center font-bold ${h.delta > 0 ? 'text-green-500' : h.delta < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                        {h.delta > 0 ? '+' : ''}{h.delta}
                      </div>
                      <div>
                        <div className="font-bold text-white mb-0.5">{h.packId}</div>
                        <div className="text-xs text-gray-500">{new Date(h.date).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-extrabold">{h.scorePct}%</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">Score</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
             <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span className="h-4 w-1 bg-yellow-500 rounded-full"></span>
              Unlocked Packs
            </h2>
            <div className="bg-[#1a1c23] border border-white/5 rounded-xl p-5">
              {(!user.packsUnlocked || user.packsUnlocked.length === 0) ? (
                <div className="text-sm text-gray-400 text-center py-4">No premium packs unlocked.</div>
              ) : (
                <ul className="space-y-2">
                  {user.packsUnlocked.map((p: string) => (
                    <li key={p} className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="text-yellow-500">★</span> {p}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}