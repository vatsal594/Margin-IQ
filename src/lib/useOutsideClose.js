import { useEffect, useRef } from "react";

/** Calls onClose on a click outside `ref` or on Escape, while `open`. */
export function useOutsideClose(ref, open, onClose) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onCloseRef.current();
    };
    const onKey = (e) => e.key === "Escape" && onCloseRef.current();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [ref, open]);
}
