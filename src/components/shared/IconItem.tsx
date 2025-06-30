import "./IconItem.css";
import "../styles.css";

interface IconItemProps {
  isActive?: boolean;
  icon: React.ReactNode;
  onClick?: () => void;
  text: string | React.ReactNode;
}

export function IconItem({
  isActive = false,
  icon,
  onClick,
  text,
}: IconItemProps): React.JSX.Element {
  return (
    <div
      className={`flexCol iconItem ${onClick ? "iconItemHover" : ""} ${
        isActive ? "active" : ""
      }`}
      onClick={onClick}
    >
      {icon}
      {text}
    </div>
  );
}
