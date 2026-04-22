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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {packs.map((pack) => (
          <div key={pack.id} className="bg-gray-800 rounded-lg shadow-xl overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
            <img src={pack.imageUrl || 'https://via.placeholder.com/300x150'} alt={pack.name} className="w-full h-40 object-cover"/>
            <div className="p-6">
              <h2 className="text-xl font-bold text-blue-400 mb-2">{pack.name}</h2>
              <p className="text-gray-400 mb-4">{pack.scenarios} scenarios</p>
              <div className="flex justify-between items-center mb-4">
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                  pack.tier === 1 ? "bg-yellow-500 text-gray-900" :
                  pack.tier === 2 ? "bg-gray-500 text-white" :
                  "bg-orange-700 text-white"
                }`}>
                  Tier {pack.tier}
                </span>
                <p className="text-lg font-bold">{pack.price}</p>
              </div>
              <div className="flex flex-col space-y-2 mt-4">
                <Link href={`/admin/packs/${pack.id}`} className="w-full">
                  <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors">
                    Manage Content
                  </button>
                </Link>
                <div className="flex space-x-2">
                  <button onClick={() => handleOpenModal(pack)} className="flex-1 bg-white/5 hover:bg-blue-500/20 border border-white/10 hover:border-blue-500/50 text-blue-400 text-sm font-semibold py-2 px-4 rounded-lg transition-colors">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(pack.id)} className="flex-1 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/50 text-red-400 text-sm font-semibold py-2 px-4 rounded-lg transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-gray-700 p-8 rounded-lg shadow-2xl max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-6 text-white">{selectedPack ? "Edit Pack" : "Add New Pack"}</h2>
            <PackForm pack={selectedPack} onSave={handleSave} onCancel={handleCloseModal} />
          </div>
        </div>
      )}
    </div>
  );
}
