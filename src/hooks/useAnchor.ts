import { useState, useCallback } from "react";

export function useAnchor() {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null
  );

  const anchor = useCallback(
    (
      element?: HTMLElement | null,
      customCoords?: { top: number; left: number }
    ) => {
      if (customCoords) {
        return setCoords(customCoords);
      }

      if (!element) return;

      const clientRect = element.getBoundingClientRect();
      setCoords({
        top: clientRect.bottom + window.scrollY, //Default to below the element
        left: clientRect.left + window.scrollX, // Default to align to the left of the element
      });
    },
    []
  );

  return { coords, anchor };
}
