"use client";

import { useState, useEffect } from "react";
import { Pack, Theme } from "@/types/pack";
import { THEMES, THEME_ORDER } from "@/lib/themes";
import ImageSelector from "@/components/admin/ImageSelector";

type FormState = {
  name: string;
  theme: Theme;
  subtitle: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  tier: number;
  price: string;
  tournament: string;
  isPremium: boolean;
  imageUrl: string;
  scenarioIds: string;
};

const DEFAULT_STATE: FormState = {
  name: "",
  theme: "decision",
  subtitle: "",
  description: "",
  difficulty: "intermediate",
  tier: 2,
  price: "Free",
  tournament: "",
  isPremium: false,
  imageUrl: "",
  scenarioIds: "",
};

export default function PackForm({
  pack,
  onSave,
  onCancel,
}: {
  pack?: Pack | null;
  onSave: (pack: Partial<Pack>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<FormState>(DEFAULT_STATE);

  useEffect(() => {
    if (pack) {
      setFormData({
        name: pack.name ?? "",
        theme: (pack.theme as Theme) ?? "decision",
        subtitle: pack.subtitle ?? "",
        description: pack.description ?? "",
        difficulty: pack.difficulty ?? "intermediate",
        tier: pack.tier ?? 2,
        price: pack.price ?? "Free",
        tournament: pack.tournament ?? "",
        isPremium: pack.isPremium ?? false,
        imageUrl: pack.imageUrl ?? "",
        scenarioIds: pack.scenarioIds ? pack.scenarioIds.join(", ") : "",
      });
    } else {
      setFormData(DEFAULT_STATE);
    }
  }, [pack]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : name === "tier" ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const scenarioIds = formData.scenarioIds
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    const packData: Partial<Pack> = {
      name: formData.name,
      theme: formData.theme,
      subtitle: formData.subtitle || undefined,
      description: formData.description || undefined,
      difficulty: formData.difficulty,
      tier: formData.tier,
      price: formData.price,
      tournament: formData.tournament || undefined,
      isPremium: formData.isPremium,
      imageUrl: formData.imageUrl,
      scenarios: scenarioIds.length,
      scenarioIds,
    };
    onSave(packData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 w-[32rem] max-w-full">
      <div>
        <label className="block text-sm font-medium text-gray-300">Pack name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full p-2 rounded bg-gray-600 text-white border border-gray-500"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">Fundamental (theme)</label>
          <select
            name="theme"
            value={formData.theme}
            onChange={handleChange}
            className="mt-1 block w-full p-2 rounded bg-gray-600 text-white border border-gray-500"
          >
            {THEME_ORDER.map((t) => (
              <option key={t} value={t}>
                {THEMES[t].name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Difficulty</label>
          <select
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            className="mt-1 block w-full p-2 rounded bg-gray-600 text-white border border-gray-500"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Subtitle</label>
        <input
          type="text"
          name="subtitle"
          value={formData.subtitle}
          onChange={handleChange}
          placeholder="Short tagline shown under the pack name"
          className="mt-1 block w-full p-2 rounded bg-gray-600 text-white border border-gray-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          placeholder="What does this pack teach?"
          className="mt-1 block w-full p-2 rounded bg-gray-600 text-white border border-gray-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">Tier</label>
          <select
            name="tier"
            value={formData.tier}
            onChange={handleChange}
            className="mt-1 block w-full p-2 rounded bg-gray-600 text-white border border-gray-500"
          >
            <option value={1}>Tier 1</option>
            <option value={2}>Tier 2</option>
            <option value={3}>Tier 3</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Price</label>
          <input
            type="text"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Free or $4.99"
            className="mt-1 block w-full p-2 rounded bg-gray-600 text-white border border-gray-500"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">Tournament</label>
          <input
            type="text"
            name="tournament"
            value={formData.tournament}
            onChange={handleChange}
            placeholder="e.g. IEM Rio 2026"
            className="mt-1 block w-full p-2 rounded bg-gray-600 text-white border border-gray-500"
          />
        </div>
        <div className="flex items-center mt-6">
          <input
            type="checkbox"
            name="isPremium"
            id="isPremium"
            checked={formData.isPremium}
            onChange={handleChange}
            className="h-4 w-4 rounded bg-gray-600 border-gray-500 text-blue-600"
          />
          <label htmlFor="isPremium" className="ml-2 block text-sm font-medium text-gray-300">
            Premium Pack
          </label>
        </div>
      </div>

      <ImageSelector
        label="Pack Image"
        value={formData.imageUrl}
        onChange={(val) => setFormData(prev => ({ ...prev, imageUrl: val }))}
      />

      <div>
        <label className="block text-sm font-medium text-gray-300">
          Scenario IDs (comma-separated)
        </label>
        <input
          type="text"
          name="scenarioIds"
          value={formData.scenarioIds}
          onChange={handleChange}
          placeholder="ct-1, ct-2, ct-3"
          className="mt-1 block w-full p-2 rounded bg-gray-600 text-white border border-gray-500"
        />
        <p className="mt-1 text-xs text-gray-400">
          Count of scenarios is derived from this list.
        </p>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={onCancel}
          className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-semibold text-sm py-2 px-4 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-primary hover:bg-primary/90 text-white font-semibold text-sm py-2 px-4 rounded-lg shadow-md shadow-primary/20 transition-colors"
        >
          Save Pack
        </button>
      </div>
    </form>
  );
}
