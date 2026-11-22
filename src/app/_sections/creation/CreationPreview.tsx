import Image from "next/image";
import Reveal from "@/_components/animations/Reveal";
import { BlockView } from "@/_components/game/BlockView";
import { createBlock, type Block } from "@/lib/blocks";

const block = (
  type: string,
  params: Block["params"],
  children?: Block[],
): Block => {
  const x = createBlock(type);
  return {
    ...x,
    params: { ...x.params, ...params },
    ...(children ? { children } : {}),
  };
};
const EXAMPLE = block("ev_key", { key: "ArrowRight" }, [
  block("move", { dir: "right", n: 10 }),
]);

/** Capture du studio de création, avec un exemple de blocs posé par-dessus. */
export default function CreationPreview() {
  return (
    <Reveal className="relative">
      <div className="toon overflow-hidden rounded-[28px] bg-paper shadow-pop-xl">
        <Image
          src="/screens/creer.webp"
          width={1298}
          height={757}
          sizes="(min-width: 1024px) 560px, 100vw"
          alt="Le studio de création libre : la scène avec un robot et une étoile, la liste des personnages et les blocs « quand j'appuie sur → droite, aller de 12 pas »."
          className="h-auto w-full"
        />
      </div>
      <div className="absolute -bottom-10 -left-4 hidden -rotate-3 sm:block">
        <BlockView mode="static" block={EXAMPLE} />
      </div>
    </Reveal>
  );
}
