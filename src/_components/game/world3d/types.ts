import { type StepKind } from "@/lib/levels";

export type WorldEvent = {
  kind: StepKind | "reset";
  at?: { x: number; y: number };
  key: number;
};
