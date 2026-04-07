interface Props{
    rightWidth: string
}

export function PanelEdgeOverlay({rightWidth} : Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="8 4 1 5" 
        className="pointer-events-none absolute top-0 z-30 h-[160px] w-[24px] -translate-x-[12px]"
        style={{ right: rightWidth }} 
        preserveAspectRatio="none">
            {/*Need to fix Right Width as it is hardcoded rn*/}
        <defs>
            <clipPath id="panelShape">
            <path
                d="
                M 9 9
  C 9 8.78 8.98 8.52 8.92 8.28
  C 8.86 8.1 8.72 7.96 8.56 7.9
  C 8.32 7.82 8.08 7.72 7.86 7.46
  C 7.68 7.24 7.62 6.96 7.62 6.5
  C 7.62 6.04 7.68 5.76 7.86 5.54
  C 8.08 5.28 8.32 5.18 8.56 5.1
  C 8.72 5.04 8.86 4.9 8.92 4.72
  C 8.98 4.48 9 4.22 9 4
  Z
                "
            />
            </clipPath>
        </defs>

        <path
            d="
            M 9 9
  C 9 8.78 8.98 8.52 8.92 8.28
  C 8.86 8.1 8.72 7.96 8.56 7.9
  C 8.32 7.82 8.08 7.72 7.86 7.46
  C 7.68 7.24 7.62 6.96 7.62 6.5
  C 7.62 6.04 7.68 5.76 7.86 5.54
  C 8.08 5.28 8.32 5.18 8.56 5.1
  C 8.72 5.04 8.86 4.9 8.92 4.72
  C 8.98 4.48 9 4.22 9 4
  Z
            "
            className="fill-base-200"
        />

        <g clipPath="url(#panelShape)">
            <circle cx="8.45" cy="5.9" r="0.07" className="fill-base-content/40" />
            <circle cx="8.45" cy="6.5" r="0.07" className="fill-base-content/40" />
            <circle cx="8.45" cy="7.1" r="0.07" className="fill-base-content/40" />
        </g>
    </svg>
  );
}