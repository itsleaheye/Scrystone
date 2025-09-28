import React, { useState, useRef, useEffect } from "react";
import "../styles.css";

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  theme?: "light" | "dark";
}

export function Tooltip({
  children,
  content,
  position = "bottom",
  theme = "dark",
}: TooltipProps): React.JSX.Element {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible && targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      let top = rect.top;
      let left = rect.left;

      switch (position) {
        case "top":
          top = rect.top - 8;
          left = rect.left + rect.width / 2;
          break;
        case "bottom":
          top = rect.bottom + 8;
          left = rect.left + rect.width / 2;
          break;
        case "left":
          top = rect.top + rect.height / 2;
          left = rect.left - 8;
          break;
        case "right":
          top = rect.top + rect.height / 2;
          left = rect.right + 8;
          break;
      }

      setCoords({ top, left });
    }
  }, [visible, position]);

  return (
    <div
      ref={targetRef}
      className="tooltipWrapper"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className={`tooltip ${theme}Tooltip tooltipAnimation`}
          style={{
            top: coords.top,
            left: coords.left,
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
}
