import { useCallback, useEffect } from "react";

type Options = {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  containerRef?: React.RefObject<HTMLElement | null>; // optional
  value?: string; // optional (for controlled inputs)
};

export function useAutoResizeTextarea({
  textareaRef,
  containerRef,
  value,
}: Options) {
  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [textareaRef]);

  // Run when value changes (typing, programmatic updates)
  useEffect(() => {
    resize();
  }, [value, resize]);

  // Run on mount + container resize (panel resizing)
  useEffect(() => {
    resize();

    if (!containerRef?.current) return;

    const observer = new ResizeObserver(resize);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [containerRef, resize]);

  return resize; // optional, useful for manual triggers
}