"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Pack } from "@/types/pack";
import { Scenario } from "@/types/scenario";
import ScenarioForm from "@/components/admin/ScenarioForm"; // Assuming this exists

export default function ManagePackContentPage() {
  const params = useParams();
  const packId = params.id as string;

  const [pack, setPack] = useState<Pack | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);

  const fetchPackAndScenarios = useCallback(async () => {
    // Fetch pack details
    const packRes = await fetch(`/api/packs/${packId}`);
    const packData: Pack = await packRes.json();
    setPack(packData);

    // Fetch associated scenarios
    if (packData.scenarioIds && packData.scenarioIds.length > 0) {
      const scenarioPromises = packData.scenarioIds.map(id =>
        fetch(`/api/scenarios/${id}`).then(res => res.json())
      );
      const fetchedScenarios = await Promise.all(scenarioPromises);
      setScenarios(fetchedScenarios);
    } else {
      setScenarios([]);
    }
  }, [packId]); // packId is a dependency for useCallback

  useEffect(() => {
    if (packId) {
      fetchPackAndScenarios();
    }
  }, [packId, fetchPackAndScenarios]);

  const handleOpenModal = (scenario: Scenario | null = null) => {
    setSelectedScenario(scenario);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedScenario(null);
  };

  const handleSaveScenario = async (scenarioData: Partial<Scenario>) => {
    if (selectedScenario) {
      // Update existing scenario
      const res = await fetch(`/api/scenarios/${selectedScenario.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scenarioData),
      });
      const updatedScenario = await res.json();
      setScenarios(scenarios.map(s => s.id === updatedScenario.id ? updatedScenario : s));
    } else {
      // Add new scenario and associate with pack
      const res = await fetch('/api/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scenarioData),
      });
      const newScenario = await res.json();
      
      // Update pack with new scenario ID
      if (pack) {
        const updatedPack = {
          ...pack,
          scenarioIds: [...(pack.scenarioIds || []), newScenario.id],
        };
        await fetch(`/api/packs/${pack.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedPack),
        });
        setPack(updatedPack);
        setScenarios([...scenarios, newScenario]);
      }
    }
    handleCloseModal();
  };

  const handleDeleteScenario = async (scenarioId: string) => {
    if (confirm('Are you sure you want to delete this scenario?')) {
      // Delete scenario
      await fetch(`/api/scenarios/${scenarioId}`, {
        method: 'DELETE',
      });
      
      // Remove scenario ID from pack
      if (pack) {
        const updatedPack = {
          ...pack,
          scenarioIds: pack.scenarioIds.filter(id => id !== scenarioId),
        };
        await fetch(`/api/packs/${pack.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedPack),
        });
        setPack(updatedPack);
        setScenarios(scenarios.filter(s => s.id !== scenarioId));
      }
    }
  };

  if (!pack) {
    return <div className="text-white">Loading pack details...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold text-white mb-8">Manage Content for Pack: {pack.name}</h1>

      <button 
        onClick={() => handleOpenModal()}
        className="bg-primary hover:bg-primary/90 text-white text-sm font-bold py-2.5 px-5 rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-95 mb-8"
      >
        Add New Scenario
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {scenarios.map((scenario) => (
          <div key={scenario.id} className="bg-gray-800 rounded-lg shadow-xl overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
            <img src={scenario.image || 'https://via.placeholder.com/300x150'} alt={scenario.title} className="w-full h-40 object-cover"/>
            <div className="p-6">
              <h2 className="text-xl font-bold text-blue-400 mb-2">{scenario.title}</h2>
              <p className="text-gray-400 mb-4">Map: {scenario.map}</p>
              <div className="flex space-x-2 mt-4">
                <button onClick={() => handleOpenModal(scenario)} className="flex-1 bg-white/5 hover:bg-blue-500/20 border border-white/10 hover:border-blue-500/50 text-blue-400 text-sm font-semibold py-2 px-4 rounded-lg transition-colors">
                  Edit
                </button>
                <button onClick={() => handleDeleteScenario(scenario.id)} className="flex-1 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/50 text-red-400 text-sm font-semibold py-2 px-4 rounded-lg transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-gray-700 p-8 rounded-lg shadow-2xl max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-6 text-white">{selectedScenario ? "Edit Scenario" : "Add New Scenario"}</h2>
            <ScenarioForm scenario={selectedScenario} onSave={handleSaveScenario} onCancel={handleCloseModal} />
          </div>
        </div>
      )}
    </div>
  );
}