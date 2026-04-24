"use client";

import { useState, useEffect } from "react";
import { Scenario, ScenarioOption, OptionQuality } from "@/types/scenario";
import { Theme } from "@/types/pack";
import { MapOverlay } from "@/types/overlay";
import { THEMES, THEME_ORDER, QUALITY } from "@/lib/themes";
import MapOverlayEditor from "@/components/admin/MapOverlayEditor";
import MapOverlayRenderer from "@/components/MapOverlayRenderer";
import ImageSelector from "@/components/admin/ImageSelector";

const MAPS = ["Any", "Inferno", "Mirage", "Nuke", "Overpass", "Vertigo", "Ancient", "Anubis", "Dust2", "Train"] as const;
const QUALITIES: OptionQuality[] = ["perfect", "excellent", "good", "blunder"];

type AxisBlock = { title: string; description: string };

type FormState = {
  title: string;
  theme: Theme;
  subcategory: string;
  map: string;
  description: string;
  image: string;
  video: string;
  overlay: MapOverlay | null;
  macro: AxisBlock;
  micro: AxisBlock;
  communication: AxisBlock;
  options: ScenarioOption[];
};

const DEFAULT_STATE: FormState = {
  title: "",
  theme: "decision",
  subcategory: "",
  map: "Any",
  description: "",
  image: "",
  video: "",
  overlay: null,
  macro: { title: "Context", description: "" },
  micro: { title: "Principle", description: "" },
  communication: { title: "Team cue", description: "" },
  options: [
    { id: 1, text: "", quality: "perfect", feedback: "" },
    { id: 2, text: "", quality: "excellent", feedback: "" },
    { id: 3, text: "", quality: "good", feedback: "" },
    { id: 4, text: "", quality: "blunder", feedback: "" },
  ],
};

export default function ScenarioForm({
  scenario,
  onSave,
  onCancel,
}: {
  scenario?: Scenario | null;
  onSave: (scenario: Partial<Scenario>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<FormState>(DEFAULT_STATE);
  const [overlayOpen, setOverlayOpen] = useState(false);

  useEffect(() => {
    if (scenario) {
      setFormData({
        title: scenario.title ?? "",
        theme: ((scenario.theme as Theme) ?? "decision") as Theme,
        subcategory: scenario.subcategory ?? "",
        map: scenario.map ?? "Any",
        description: scenario.description ?? "",
        image: scenario.image ?? "",
        video: scenario.video ?? "",
        overlay: scenario.overlay ?? null,
        macro: { title: scenario.macro?.title ?? "Context", description: scenario.macro?.description ?? "" },
        micro: { title: scenario.micro?.title ?? "Principle", description: scenario.micro?.description ?? "" },
        communication: {
          title: scenario.communication?.title ?? "Team cue",
          description: scenario.communication?.description ?? "",
        },
        options: (scenario.options ?? DEFAULT_STATE.options).map((o) => ({
          id: o.id,
          text: o.text ?? "",
          feedback: o.feedback ?? "",
          quality: o.quality ?? (o.isCorrect ? "excellent" : "blunder"),
        })),
      });
    } else {
      setFormData(DEFAULT_STATE);
    }
  }, [scenario]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const setAxis = (axis: "macro" | "micro" | "communication", field: keyof AxisBlock, value: string) =>
    setFormData((prev) => ({ ...prev, [axis]: { ...prev[axis], [field]: value } }));

  const setOption = (index: number, patch: Partial<ScenarioOption>) =>
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((o, i) => (i === index ? { ...o, ...patch } : o)),
    }));

  const addOption = () =>
    setFormData((prev) => ({
      ...prev,
      options: [
        ...prev.options,
        {
          id: (prev.options.at(-1)?.id ?? 0) + 1,
          text: "",
          quality: "good",
          feedback: "",
        },
      ],
    }));

  const removeOption = (index: number) =>
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<Scenario> = {
      title: formData.title,
      theme: formData.theme,
      subcategory: formData.subcategory || undefined,
      map: formData.map,
      description: formData.description,
      image: formData.image || undefined,
      video: formData.video || undefined,
      overlay: formData.overlay && formData.overlay.items.length > 0 ? formData.overlay : undefined,
      macro: formData.macro,
      micro: formData.micro,
      communication: formData.communication,
      options: formData.options.map((o, i) => ({
        id: i + 1,
        text: o.text,
        quality: o.quality,
        feedback: o.feedback,
      })),
    };
    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-[48rem] max-w-full max-h-[80vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setField("title", e.target.value)}
              className="mt-1 block w-full p-2 rounded bg-gray-600 text-white border border-gray-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300">Fundamental</label>
              <select
                value={formData.theme}
                onChange={(e) => setField("theme", e.target.value as Theme)}
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
              <label className="block text-sm font-medium text-gray-300">Map</label>
              <select
                value={formData.map}
                onChange={(e) => setField("map", e.target.value)}
                className="mt-1 block w-full p-2 rounded bg-gray-600 text-white border border-gray-500"
              >
                {MAPS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Subcategory</label>
            <input
              type="text"
              value={formData.subcategory}
              onChange={(e) => setField("subcategory", e.target.value)}
              placeholder="e.g. XvY reaction — 5v4 post-trade"
              className="mt-1 block w-full p-2 rounded bg-gray-600 text-white border border-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setField("description", e.target.value)}
              rows={3}
              className="mt-1 block w-full p-2 rounded bg-gray-600 text-white border border-gray-500"
              required
            />
          </div>

          <ImageSelector
            label="Map Image"
            value={formData.image}
            onChange={(val) => setField("image", val)}
          />

          <div className="border border-white/10 rounded p-3 space-y-2 bg-white/5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-400">Map overlay</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {formData.overlay?.items?.length
                    ? `${formData.overlay.items.length} item${formData.overlay.items.length > 1 ? "s" : ""} (smokes, flashes, players, notes…)`
                    : "None. Add smokes, flashes, player dots, notes…"}
                </div>
              </div>
              <div className="flex gap-2">
                {formData.overlay?.items?.length ? (
                  <button
                    type="button"
                    onClick={() => setField("overlay", null)}
                    className="bg-white/5 hover:bg-red-500/20 border border-white/10 text-red-300 text-xs font-semibold py-1.5 px-2 rounded"
                  >
                    Clear
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setOverlayOpen(true)}
                  className="bg-primary/20 hover:bg-primary/30 border border-primary/40 text-white text-xs font-semibold py-1.5 px-3 rounded"
                >
                  {formData.overlay?.items?.length ? "Edit overlay" : "Open editor"}
                </button>
              </div>
            </div>

            {formData.image && formData.overlay?.items?.length ? (
              <div className="relative mx-auto rounded border border-white/10 overflow-hidden bg-slate-900" style={{ aspectRatio: "1 / 1", width: "100%", maxWidth: 240 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={formData.image}
                  alt="overlay preview"
                  className="w-full h-full object-contain"
                />
                <MapOverlayRenderer overlay={formData.overlay} />
              </div>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Video URL</label>
            <input
              type="text"
              value={formData.video}
              onChange={(e) => setField("video", e.target.value)}
              placeholder="optional (mp4 or YouTube URL)"
              className="mt-1 block w-full p-2 rounded bg-gray-600 text-white border border-gray-500"
            />
          </div>

          {(["macro", "micro", "communication"] as const).map((axis) => (
            <div key={axis} className="border border-gray-600 rounded p-3 space-y-2">
              <div className="text-xs uppercase tracking-wide text-gray-400">{axis}</div>
              <input
                type="text"
                value={formData[axis].title}
                onChange={(e) => setAxis(axis, "title", e.target.value)}
                placeholder="Axis title"
                className="block w-full p-2 rounded bg-gray-600 text-white border border-gray-500"
                required
              />
              <textarea
                value={formData[axis].description}
                onChange={(e) => setAxis(axis, "description", e.target.value)}
                rows={2}
                placeholder="Axis description"
                className="block w-full p-2 rounded bg-gray-600 text-white border border-gray-500"
                required
              />
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-200">Options</h3>
            <button
              type="button"
              onClick={addOption}
              className="text-primary hover:text-primary/80 text-sm font-bold flex items-center gap-1 transition-colors"
            >
              + Add option
            </button>
          </div>

          {formData.options.map((option, index) => {
            const q = QUALITY[option.quality ?? "good"];
            return (
              <div key={option.id} className={`p-3 border border-gray-600 rounded-lg ${q.bg}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-200">Option {index + 1}</span>
                  <div className="flex items-center gap-2">
                    <select
                      value={option.quality ?? "good"}
                      onChange={(e) =>
                        setOption(index, { quality: e.target.value as OptionQuality })
                      }
                      className={`p-1 rounded bg-gray-700 text-white border border-gray-500 text-sm ${q.text}`}
                    >
                      {QUALITIES.map((qk) => (
                        <option key={qk} value={qk}>
                          {QUALITY[qk].label} ({QUALITY[qk].score})
                        </option>
                      ))}
                    </select>
                    {formData.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="text-red-400 hover:text-red-300 text-sm"
                        aria-label="Remove option"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
                <textarea
                  value={option.text}
                  onChange={(e) => setOption(index, { text: e.target.value })}
                  rows={2}
                  placeholder="Option text"
                  className="block w-full p-2 rounded bg-gray-600 text-white border border-gray-500"
                  required
                />
                <textarea
                  value={option.feedback}
                  onChange={(e) => setOption(index, { feedback: e.target.value })}
                  rows={2}
                  placeholder="Feedback when this option is chosen"
                  className="mt-2 block w-full p-2 rounded bg-gray-600 text-white border border-gray-500"
                  required
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-white/10 mt-6">
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
          Save Scenario
        </button>
      </div>

      {overlayOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOverlayOpen(false);
          }}
        >
          <div className="bg-gray-800 border border-white/10 rounded-xl p-4 shadow-2xl max-w-[96vw] max-h-[96vh] overflow-auto">
            <MapOverlayEditor
              image={formData.image}
              overlay={formData.overlay}
              onSave={(overlay) => {
                setField("overlay", overlay.items.length ? overlay : null);
                setOverlayOpen(false);
              }}
              onCancel={() => setOverlayOpen(false)}
            />
          </div>
        </div>
      )}
    </form>
  );
}
