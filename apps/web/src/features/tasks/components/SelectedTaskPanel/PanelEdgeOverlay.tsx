interface Props {
  rightWidth: string;
}

export function PanelEdgeOverlay({ rightWidth }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="9 0 1 10"
      className="absolute top-0 z-30 h-[160px] w-[24px] -translate-x-[12px] hover:scale-150"
      style={{ right: rightWidth }}
      preserveAspectRatio="none"
    >
      <path
        d="M 10 16 L 10 10 L 9 9 L 9 7 L 10 6 L 10 0 Z"
        className="fill-base-200 stroke-base-300"
        strokeWidth="0.05"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
