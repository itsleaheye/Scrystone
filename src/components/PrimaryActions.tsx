import "./styles.css";

interface ActionButtonProps {
  hideLabel?: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variation: "destroy" | "primary" | "tertiary" | "secondary";
}

export function ActionButton({
  hideLabel = false,
  icon,
  label,
  onClick,
  variation,
}: ActionButtonProps): React.JSX.Element {
  return (
    <button
      className={`${variation}Button ${
        hideLabel ? "smallActionButton" : "actionButton"
      }`}
      onClick={onClick}
    >
      {icon}
      {!hideLabel && label}
    </button>
  );
}
