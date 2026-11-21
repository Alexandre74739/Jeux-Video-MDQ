"use client";
import {
  ArrowUp, CornerUpLeft, CornerUpRight, Gem, Pickaxe, Fence, Repeat, CircleHelp, Play, Keyboard,
  MousePointerClick, Shapes, Zap, Move, Dices, Crosshair, MessageCircle, ZoomIn, ZoomOut, EyeOff, Eye,
  RotateCw, Volume2, Hourglass, Infinity as InfinityIcon, Star, RotateCcw, Trophy, Skull, Sparkles, Music,
  Footprints, Crown, Undo2, ChevronsUp, KeyRound, Repeat2, Split, Package, Flame, Mountain, Award, TreePalm, Lighthouse, Map as MapIcon, Target, Layers, Brain, Shirt, Swords, type LucideIcon,
} from "lucide-react";

export const ICONS: Record<string, LucideIcon> = {
  ArrowUp, CornerUpLeft, CornerUpRight, Gem, Pickaxe, Fence, Repeat, CircleHelp, Play, Keyboard,
  MousePointerClick, Shapes, Zap, Move, Dices, Crosshair, MessageCircle, ZoomIn, ZoomOut, EyeOff, Eye,
  RotateCw, Volume2, Hourglass, Infinity: InfinityIcon, Star, RotateCcw, Trophy, Skull, Sparkles, Music,
  Footprints, Crown, Undo2, ChevronsUp, KeyRound, Repeat2, Split, Package, Flame, Mountain, Award,
  Palmtree: TreePalm, TowerControl: Lighthouse, Map: MapIcon, Target, Layers, Brain, Shirt, Swords,
};

/** Icône du catalogue (par nom), trait épais façon dessin animé. */
export function Icon({ name, size = 18, className = "" }: { name: string; size?: number; className?: string }) {
  const C = ICONS[name];
  if (!C) return null;
  return <C size={size} strokeWidth={2.75} className={className} aria-hidden="true" />;
}

/** Étoile pleine jaune cerclée d'encre (ou vide). */
export function StarIcon({ size = 20, filled = true, className = "" }: { size?: number; filled?: boolean; className?: string }) {
  return (
    <Star
      size={size}
      strokeWidth={2.5}
      className={className}
      fill={filled ? "#FFD23F" : "#E8E4F0"}
      color={filled ? "#16123A" : "#9A95B5"}
      aria-hidden="true"
    />
  );
}
