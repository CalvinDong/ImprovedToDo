interface Props{
    rightWidth: string
}

export function PanelEdgeOverlay({rightWidth} : Props) {
  return (
    <svg viewBox="8.8 5.8 1.8 4.4" className="h-40 w-8">
    <path d="M 10 10 Q 9.1 9.2 9 9 L 9 7 Q 9.1 6.8 10 6 L 10.4 6 Q 9.5 6.8 9.4 7 L 9.4 9 Q 9.5 9.2 10.4 10 Z" />
    </svg>
  );
}