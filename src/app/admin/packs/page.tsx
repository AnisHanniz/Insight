"use client";

import { useState, useEffect } from "react";
import PackForm from "@/components/admin/PackForm"; // Import the form component
import { Pack } from "@/types/pack"; // Import the Pack interface
import Link from "next/link"; // Import Link for navigation

export default function ManagePacksPage() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);

  useEffect(() => {
    const fetchPacks = async () => {
      const res = await fetch('/api/packs');
      const data = await res.json();
      setPacks(data);
    };
    fetchPacks();
  }, []);

  const handleOpenModal = (pack: any = null) => {
    setSelectedPack(pack);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPack(null);
  };

  const handleSave = async (packData: any) => {
    if (selectedPack) {
      // Update existing pack
      const res = await fetch(`/api/packs/${selectedPack.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packData),
      });
      const updatedPack = await res.json();
      setPacks(packs.map(p => p.id === updatedPack.id ? updatedPack : p));
    } else {
      // Add new pack
      const res = await fetch('/api/packs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packData),
      });
      const newPack = await res.json();
      setPacks([...packs, newPack]);
    }
    handleCloseModal();
  };

  const handleDelete = async (packId: string) => {
    if (confirm('Are you sure you want to delete this pack?')) {
      await fetch(`/api/packs/${packId}`, {
        method: 'DELETE',
      });
      setPacks(packs.filter(p => p.id !== packId));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Manage Packs</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary hover:bg-primary/90 text-white text-sm font-bold py-2.5 px-5 rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          Add New Pack
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packs.map((pack) => (
          <div key={pack.id} className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
            {pack.imageUrl ? (
              <img src={pack.imageUrl} alt={pack.name} className="w-full h-28 object-cover"/>
            ) : (
              <div className="w-full h-28 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                <span className="text-gray-500 text-xs uppercase tracking-widest font-bold">No image</span>
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between mb-1">
                <h2 className="text-base font-bold text-blue-400 leading-tight">{pack.name}</h2>
                {pack.isPremium && <span className="ml-2 shrink-0 text-xs font-bold px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">PREMIUM</span>}
              </div>
              <p className="text-gray-400 text-xs mb-3">
                {pack.scenarios} scenarios · <span className="capitalize">{pack.difficulty ?? "intermediate"}</span> · {pack.price}
              </p>
              <div className="flex flex-col space-y-1.5">
                <Link href={`/admin/packs/${pack.id}`} className="w-full">
                  <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-colors">
                    Manage Content
                  </button>
                </Link>
                <div className="flex space-x-2">
                  <button onClick={() => handleOpenModal(pack)} className="flex-1 bg-white/5 hover:bg-blue-500/20 border border-white/10 hover:border-blue-500/50 text-blue-400 text-xs font-semibold py-1.5 px-4 rounded-lg transition-colors">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(pack.id)} className="flex-1 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/50 text-red-400 text-xs font-semibold py-1.5 px-4 rounded-lg transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-gray-700 p-6 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-5 text-white">{selectedPack ? "Edit Pack" : "Add New Pack"}</h2>
            <PackForm pack={selectedPack} onSave={handleSave} onCancel={handleCloseModal} />
          </div>
        </div>
      )}
    </div>
  );
}
