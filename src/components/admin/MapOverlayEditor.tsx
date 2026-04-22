"use client";

import { useEffect, useRef, useState } from "react";
import type { MapOverlay, OverlayItem, OverlayItemType } from "@/types/overlay";
import MapOverlayRenderer, { defaultSize } from "@/components/MapOverlayRenderer";

type Tool = "cursor" | OverlayItemType;

const TOOLS: { key: Tool; label: string; swatch: string }[] = [
  { key: "cursor", label: "Select", swatch: "bg-white/20" },
  { key: "smoke", label: "Smoke", swatch: "bg-slate-300" },
  { key: "molotov", label: "Molotov", swatch: "bg-orange-500" },
  { key: "flash", label: "Flash", swatch: "bg-yellow-300" },
  { key: "he", label: "HE", swatch: "bg-red-700" },
  { key: "player-ct", label: "CT", swatch: "bg-blue-500" },
  { key: "player-t", label: "T", swatch: "bg-amber-500" },
  { key: "text", label: "Note", swatch: "bg-yellow-500/60" },
  { key: "arrow", label: "Arrow", swatch: "bg-red-400" },
];

function uid() {
  return `ov-${Math.random().toString(36).slice(2, 9)}`;
}

type DragState =
  | { mode: "move"; id: string; offX: number; offY: number }
  | { mode: "arrow-new"; id: string }
  | { mode: "arrow-tail"; id: string }
  | null;

export default function MapOverlayEditor({
  image,
  overlay,
  onSave,
  onCancel,
}: {
  image?: string;
  overlay?: MapOverlay | null;
  onSave: (overlay: MapOverlay) => void;
  onCancel: () => void;
}) {
  const [items, setItems] = useState<OverlayItem[]>(overlay?.items ?? []);
  const [tool, setTool] = useState<Tool>("cursor");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drag, setDrag] = useState<DragState>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const selected = items.find((i) => i.id === selectedId) ?? null;
  const copiedItemRef = useRef<OverlayItem | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        setItems((arr) => arr.filter((i) => i.id !== selectedId));
        setSelectedId(null);
      }
      if (e.key === "Escape") setSelectedId(null);

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c" && selectedId) {
        setItems((arr) => {
          const itemToCopy = arr.find((i) => i.id === selectedId);
          if (itemToCopy) copiedItemRef.current = itemToCopy;
          return arr;
        });
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v" && copiedItemRef.current) {
        const item = copiedItemRef.current;
        const newId = uid();
        const newItem: OverlayItem = { ...item, id: newId, x: Math.min(95, item.x + 3), y: Math.min(95, item.y + 3) };
        if (newItem.type === "arrow") {
          newItem.x2 = Math.min(95, (item.x2 ?? item.x) + 3);
          newItem.y2 = Math.min(95, (item.y2 ?? item.y) + 3);
        }
        setItems((arr) => [...arr, newItem]);
        setSelectedId(newId);
        copiedItemRef.current = newItem;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId]);

  function percentFromEvent(e: { clientX: number; clientY: number }) {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 50, y: 50 };
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    };
  }

  function handleCanvasMouseDown(e: React.MouseEvent) {
    const { x, y } = percentFromEvent(e);
    if (tool === "cursor") {
      setSelectedId(null);
      return;
    }
    const id = uid();
    if (tool === "arrow") {
      const item: OverlayItem = { id, type: "arrow", x, y, x2: x, y2: y };
      setItems((arr) => [...arr, item]);
      setSelectedId(id);
      setDrag({ mode: "arrow-new", id });
      return;
    }
    const base: OverlayItem = { id, type: tool, x, y };
    if (tool === "text") base.label = "Note";
    if (tool === "player-ct") base.label = "CT";
    if (tool === "player-t") base.label = "T";
    setItems((arr) => [...arr, base]);
    setSelectedId(id);
    setTool("cursor");
  }

  function handleItemMouseDown(e: React.MouseEvent, item: OverlayItem) {
    if (tool !== "cursor") return;
    e.stopPropagation();
    setSelectedId(item.id);
    const { x, y } = percentFromEvent(e);
    setDrag({ mode: "move", id: item.id, offX: x - item.x, offY: y - item.y });
  }

  useEffect(() => {
    if (!drag) return;
    const onMove = (e: MouseEvent) => {
      const { x, y } = percentFromEvent(e);
      setItems((arr) =>
        arr.map((it) => {
          if (it.id !== drag.id) return it;
          if (drag.mode === "move") {
            const newX = x - drag.offX;
            const newY = y - drag.offY;
            if (it.type === "arrow") {
              const dx = newX - it.x;
              const dy = newY - it.y;
              return {
                ...it,
                x: newX,
                y: newY,
                x2: (it.x2 ?? it.x) + dx,
                y2: (it.y2 ?? it.y) + dy,
              };
            }
            return { ...it, x: newX, y: newY };
          }
          if (drag.mode === "arrow-new" || drag.mode === "arrow-tail")
            return { ...it, x2: x, y2: y };
          return it;
        })
      );
    };
    const onUp = () => {
      if (drag.mode === "arrow-new") {
        setItems((arr) => {
          const it = arr.find((i) => i.id === drag.id);
          if (!it || it.type !== "arrow") return arr;
          const dx = (it.x2 ?? it.x) - it.x;
          const dy = (it.y2 ?? it.y) - it.y;
          if (Math.hypot(dx, dy) < 1.5) return arr.filter((i) => i.id !== drag.id);
          return arr;
        });
        setTool("cursor");
      }
      setDrag(null);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [drag]);

  function patchSelected(patch: Partial<OverlayItem>) {
    if (!selectedId) return;
    setItems((arr) =>
      arr.map((it) => (it.id === selectedId ? { ...it, ...patch } : it))
    );
  }

  function deleteSelected() {
    if (!selectedId) return;
    setItems((arr) => arr.filter((i) => i.id !== selectedId));
    setSelectedId(null);
  }

  function clearAll() {
    if (!items.length) return;
    if (!confirm("Clear every overlay item?")) return;
    setItems([]);
    setSelectedId(null);
  }

  const hasImage = Boolean(image && image.length);
  const cursorClass =
    tool === "cursor" ? "cursor-default" : tool === "arrow" ? "cursor-crosshair" : "cursor-copy";

  return (
    <div className="w-[72rem] max-w-[95vw] max-h-[88vh] flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-xl font-extrabold">Map Overlay Editor</h3>
          <p className="text-xs text-gray-400 mt-1">
            Pick a tool, click the map to place. Drag to move. Delete key removes selected.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={clearAll}
            className="bg-white/5 hover:bg-red-500/20 border border-white/10 text-red-300 text-sm font-semibold py-2 px-3 rounded-lg"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm font-semibold py-2 px-4 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave({ items })}
            className="bg-primary hover:bg-primary/90 text-white text-sm font-semibold py-2 px-4 rounded-lg shadow-md shadow-primary/20"
          >
            Save overlay
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-2">
        {TOOLS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTool(t.key)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border transition ${
              tool === t.key
                ? "bg-primary/20 border-primary/50 text-white"
                : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
            }`}
          >
            <span className={`w-3 h-3 rounded-full ${t.swatch}`} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_18rem] gap-4 overflow-hidden">
        <div
          ref={canvasRef}
          onMouseDown={handleCanvasMouseDown}
          className={`relative rounded-xl overflow-hidden bg-slate-900 border border-white/10 select-none mx-auto ${cursorClass}`}
          style={{ aspectRatio: "1 / 1", width: "100%", maxWidth: "min(70vh, 100%)" }}
        >
          {hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt="Map"
              draggable={false}
              className="w-full h-full object-contain pointer-events-none"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-center p-8">
              <div className="text-gray-400">
                <p className="text-lg font-bold">No map image set yet.</p>
                <p className="text-sm mt-2">
                  Fill the &quot;Image URL&quot; field first (e.g. /images/maps/de_dust2.png), then reopen the editor.
                </p>
              </div>
            </div>
          )}
          <MapOverlayRenderer
            overlay={{ items }}
            interactive
            selectedId={selectedId}
            onItemMouseDown={handleItemMouseDown}
          />
        </div>

        <aside className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4 overflow-y-auto max-h-[70vh]">
          <div>
            <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">
              Selected
            </div>
            {selected ? (
              <SelectedPanel
                item={selected}
                onPatch={patchSelected}
                onDelete={deleteSelected}
              />
            ) : (
              <p className="text-sm text-gray-500">
                Click an item to edit, or pick a tool and click on the map to add one.
              </p>
            )}
          </div>

          <div>
            <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">
              Items ({items.length})
            </div>
            <ul className="space-y-1 text-sm">
              {items.map((it) => (
                <li
                  key={it.id}
                  onClick={() => setSelectedId(it.id)}
                  className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer border ${
                    selectedId === it.id
                      ? "bg-primary/20 border-primary/40"
                      : "bg-white/5 border-transparent hover:bg-white/10"
                  }`}
                >
                  <span className="text-gray-200">
                    {it.type}
                    {it.label ? ` — ${it.label}` : ""}
                  </span>
                  <span className="text-xs text-gray-500">
                    {it.x.toFixed(0)}, {it.y.toFixed(0)}
                  </span>
                </li>
              ))}
              {items.length === 0 && (
                <li className="text-xs text-gray-500 italic">Empty</li>
              )}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SelectedPanel({
  item,
  onPatch,
  onDelete,
}: {
  item: OverlayItem;
  onPatch: (p: Partial<OverlayItem>) => void;
  onDelete: () => void;
}) {
  const canResize =
    item.type === "smoke" ||
    item.type === "molotov" ||
    item.type === "flash" ||
    item.type === "he" ||
    item.type === "player-ct" ||
    item.type === "player-t";
  const canLabel =
    item.type === "text" || item.type === "player-ct" || item.type === "player-t";

  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold text-white">{item.type}</div>

      {canLabel && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Label</label>
          <input
            type="text"
            value={item.label ?? ""}
            onChange={(e) => onPatch({ label: e.target.value })}
            className="block w-full p-2 rounded bg-gray-700 text-white border border-gray-600 text-sm"
          />
        </div>
      )}

      {canResize && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">
            Size ({(item.size ?? defaultSize(item.type)).toFixed(1)})
          </label>
          <input
            type="range"
            min={0.8}
            max={8}
            step={0.1}
            value={item.size ?? defaultSize(item.type)}
            onChange={(e) => onPatch({ size: parseFloat(e.target.value) })}
            className="w-full"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <NumField label="X" value={item.x} onChange={(v) => onPatch({ x: v })} />
        <NumField label="Y" value={item.y} onChange={(v) => onPatch({ y: v })} />
        {item.type === "arrow" && (
          <>
            <NumField
              label="X2"
              value={item.x2 ?? item.x}
              onChange={(v) => onPatch({ x2: v })}
            />
            <NumField
              label="Y2"
              value={item.y2 ?? item.y}
              onChange={(v) => onPatch({ y2: v })}
            />
          </>
        )}
      </div>

      <button
        type="button"
        onClick={onDelete}
        className="w-full bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-sm font-semibold py-2 rounded-lg"
      >
        Delete item
      </button>
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">
        {label}
      </label>
      <input
        type="number"
        step={0.5}
        value={Number(value.toFixed(1))}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="block w-full p-1.5 rounded bg-gray-700 text-white border border-gray-600 text-xs"
      />
    </div>
  );
}
