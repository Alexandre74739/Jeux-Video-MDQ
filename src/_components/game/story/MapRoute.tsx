/** Carte complète : un chemin relie les lieux et le coffre apparaît au centre, sur la croix. */
export function MapRoute() {
  return (
    <g pointerEvents="none">
      <path
        d="M66 46 Q100 24 118 40 M150 88 Q150 112 84 118 M74 150 Q100 136 128 150"
        fill="none"
        stroke="#C0392B"
        strokeWidth="3"
        strokeDasharray="2 7"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M88 88 L112 112 M112 88 L88 112"
        stroke="#C0392B"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <image href="/sprites/coffre.svg" x="83" y="82" width="34" height="34" />
    </g>
  );
}
