"use client";

import type { MapOverlay, OverlayItem, OverlayItemType } from "@/types/overlay";

export function defaultSize(type: OverlayItemType): number {
  switch (type) {
    case "smoke": return 2.2;
    case "molotov": return 1.5;
    case "flash": return 0.8;
    case "he": return 1.3;
    case "player-ct":
    case "player-t": return 0.7;
    default: return 1;
  }
}

type Props = {
  overlay?: MapOverlay | null;
  className?: string;
  onItemMouseDown?: (e: React.MouseEvent, item: OverlayItem) => void;
  selectedId?: string | null;
  interactive?: boolean;
};

export default function MapOverlayRenderer({
  overlay,
  className,
  onItemMouseDown,
  selectedId,
  interactive = false,
}: Props) {
  if (!overlay?.items?.length) return null;
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={`absolute inset-0 w-full h-full pointer-events-none ${className ?? ""}`}
    >
      {overlay.items.map((item) => (
        <OverlayMark
          key={item.id}
          item={item}
          selected={selectedId === item.id}
          interactive={interactive}
          onMouseDown={(e) => onItemMouseDown?.(e, item)}
        />
      ))}
    </svg>
  );
}

function OverlayMark({
  item,
  selected,
  interactive,
  onMouseDown,
}: {
  item: OverlayItem;
  selected: boolean;
  interactive: boolean;
  onMouseDown?: (e: React.MouseEvent) => void;
}) {
  const pe = interactive ? ("auto" as const) : ("none" as const);
  const cursor = interactive ? "cursor-move" : "";
  const selectedStroke = selected ? "stroke-[1] stroke-white" : "";

  if (item.type === "arrow") {
    const x2 = item.x2 ?? item.x + 10;
    const y2 = item.y2 ?? item.y;
    const dx = x2 - item.x;
    const dy = y2 - item.y;
    const len = Math.hypot(dx, dy);
    if (len < 0.1) return null;
    const ux = dx / len;
    const uy = dy / len;
    const head = 2.2;
    const baseX = x2 - ux * head;
    const baseY = y2 - uy * head;
    const perpX = -uy;
    const perpY = ux;
    const leftX = baseX + perpX * head * 0.55;
    const leftY = baseY + perpY * head * 0.55;
    const rightX = baseX - perpX * head * 0.55;
    const rightY = baseY - perpY * head * 0.55;
    const color = selected ? "#fca5a5" : "#f87171";
    return (
      <g style={{ pointerEvents: pe }} onMouseDown={onMouseDown} className={cursor}>
        <line
          x1={item.x}
          y1={item.y}
          x2={baseX}
          y2={baseY}
          stroke={color}
          strokeWidth={selected ? 0.9 : 0.6}
          strokeLinecap="round"
        />
        <polygon
          points={`${x2},${y2} ${leftX},${leftY} ${rightX},${rightY}`}
          fill={color}
        />
        {selected && (
          <>
            <circle cx={item.x} cy={item.y} r={0.8} fill="#fff" />
            <circle cx={x2} cy={y2} r={0.8} fill="#fff" />
          </>
        )}
      </g>
    );
  }

  const size = item.size ?? defaultSize(item.type);

  if (item.type === "text") {
    const text = item.label ?? "note";
    const pad = 1;
    const estWidth = Math.max(text.length * 1.1, 4);
    return (
      <g style={{ pointerEvents: pe }} onMouseDown={onMouseDown} className={cursor}>
        <rect
          x={item.x - estWidth / 2}
          y={item.y - 2}
          width={estWidth}
          height={4}
          rx={0.6}
          fill="rgba(0,0,0,0.75)"
          stroke={selected ? "#fff" : "#fbbf24"}
          strokeWidth={0.2}
        />
        <text
          x={item.x}
          y={item.y + 0.6}
          textAnchor="middle"
          fontSize="2"
          fontWeight="700"
          fill="#fde68a"
        >
          {text}
        </text>
      </g>
    );
  }

  const common = {
    cx: item.x,
    cy: item.y,
    style: { pointerEvents: pe },
    onMouseDown,
    className: cursor,
  } as const;

  const letterFont = Math.max(0.9, size * 0.75);
  const playerFont = Math.max(0.9, size * 0.7);

  switch (item.type) {
    case "smoke":
      return (
        <g {...common}>
          <circle
            cx={item.x}
            cy={item.y}
            r={size}
            fill="rgba(226,232,240,0.55)"
            stroke={selected ? "#fff" : "rgba(148,163,184,0.9)"}
            strokeWidth={selected ? 0.4 : 0.25}
            strokeDasharray="0.8 0.4"
          />
          <text
            x={item.x}
            y={item.y + letterFont * 0.35}
            textAnchor="middle"
            fontSize={letterFont}
            fontWeight="800"
            fill="#0f172a"
          >
            S
          </text>
        </g>
      );
    case "molotov":
      return (
        <g {...common}>
          <circle
            cx={item.x}
            cy={item.y}
            r={size}
            fill="rgba(249,115,22,0.55)"
            stroke={selected ? "#fff" : "#f97316"}
            strokeWidth={selected ? 0.4 : 0.25}
          />
          <circle cx={item.x} cy={item.y} r={size * 0.55} fill="rgba(239,68,68,0.8)" />
          <text
            x={item.x}
            y={item.y + letterFont * 0.35}
            textAnchor="middle"
            fontSize={letterFont}
            fontWeight="800"
            fill="#1a0a00"
          >
            M
          </text>
        </g>
      );
    case "flash":
      return (
        <g {...common}>
          <circle
            cx={item.x}
            cy={item.y}
            r={size}
            fill="rgba(254,240,138,0.8)"
            stroke={selected ? "#fff" : "#facc15"}
            strokeWidth={selected ? 0.4 : 0.25}
          />
          <text
            x={item.x}
            y={item.y + letterFont * 0.35}
            textAnchor="middle"
            fontSize={letterFont}
            fontWeight="800"
            fill="#713f12"
          >
            F
          </text>
        </g>
      );
    case "he":
      return (
        <g {...common}>
          <circle
            cx={item.x}
            cy={item.y}
            r={size}
            fill="rgba(127,29,29,0.9)"
            stroke={selected ? "#fff" : "#ef4444"}
            strokeWidth={selected ? 0.4 : 0.25}
          />
          <text
            x={item.x}
            y={item.y + letterFont * 0.35}
            textAnchor="middle"
            fontSize={Math.max(0.8, size * 0.6)}
            fontWeight="800"
            fill="#fecaca"
          >
            HE
          </text>
        </g>
      );
    case "player-ct":
      return (
        <g {...common}>
          <circle
            cx={item.x}
            cy={item.y}
            r={size}
            fill="#3b82f6"
            stroke={selected ? "#fff" : "#1e3a8a"}
            strokeWidth={selected ? 0.5 : 0.3}
          />
          <text
            x={item.x}
            y={item.y + playerFont * 0.35}
            textAnchor="middle"
            fontSize={playerFont}
            fontWeight="800"
            fill="#ffffff"
          >
            {item.label ?? "CT"}
          </text>
        </g>
      );
    case "player-t":
      return (
        <g {...common}>
          <circle
            cx={item.x}
            cy={item.y}
            r={size}
            fill="#f59e0b"
            stroke={selected ? "#fff" : "#78350f"}
            strokeWidth={selected ? 0.5 : 0.3}
          />
          <text
            x={item.x}
            y={item.y + playerFont * 0.35}
            textAnchor="middle"
            fontSize={playerFont}
            fontWeight="800"
            fill="#1a0a00"
          >
            {item.label ?? "T"}
          </text>
        </g>
      );
    default:
      return null;
  }
}
