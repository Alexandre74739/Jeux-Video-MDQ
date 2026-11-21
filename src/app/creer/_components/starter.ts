import { createBlock, type Block } from "@/lib/blocks";
import { type Project } from "@/lib/runtime";

export function hat(type: string, params: Block["params"], children: Block[]): Block {
  return { ...createBlock(type), params, children };
}

export function blk(type: string, params: Block["params"] = {}): Block {
  const b = createBlock(type);
  return { ...b, params: { ...b.params, ...params } };
}

export function starter(): Project {
  const hero = "s-hero";
  const star = "s-star";
  return {
    bg: "prairie",
    sprites: [
      {
        id: hero, name: "Robot", src: "/sprites/1f916.svg", x: 120, y: 220, size: 100,
        scripts: [
          hat("ev_start", {}, [blk("say", { text: "Attrape l'étoile !" })]),
          hat("ev_key", { key: "ArrowRight" }, [blk("move", { dir: "right", n: 12 })]),
          hat("ev_key", { key: "ArrowLeft" }, [blk("move", { dir: "left", n: 12 })]),
          hat("ev_key", { key: "ArrowUp" }, [blk("move", { dir: "up", n: 12 })]),
          hat("ev_key", { key: "ArrowDown" }, [blk("move", { dir: "down", n: 12 })]),
        ],
      },
      {
        id: star, name: "Étoile", src: "/sprites/2b50.svg", x: 360, y: 140, size: 80,
        scripts: [
          hat("ev_touch", { target: hero }, [blk("sound", { s: "coin" }), blk("score_add", { n: 1 }), blk("random")]),
        ],
      },
    ],
  };
}
