export type OverlayItemType =
  | "smoke"
  | "molotov"
  | "flash"
  | "he"
  | "player-ct"
  | "player-t"
  | "text"
  | "arrow";

export interface OverlayItem {
  id: string;
  type: OverlayItemType;
  x: number;
  y: number;
  x2?: number;
  y2?: number;
  label?: string;
  size?: number;
}

export interface MapOverlay {
  items: OverlayItem[];
}
