import "./IconItem.css";
import "../styles.css";

interface IconItemProps {
  icon: React.ReactNode;
  onClick?: () => void;
  text: string | React.ReactNode;
}

export function IconItem({
  icon,
  onClick,
  text,
}: IconItemProps): React.JSX.Element {
  return (
    <div
      className={`flexCol iconItem ${onClick ? "iconItemHover" : ""}`}
      onClick={onClick}
    >
      {icon}
      {text}
    </div>
  );
}
