import "../styles.css";

interface ActionButtonProps {
  disabled?: boolean;
  hideLabel?: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variation: "destroy" | "primary" | "tertiary" | "secondary";
}

export function ActionButton({
  disabled = false,
  hideLabel = false,
  icon,
  label,
  onClick,
  variation,
}: ActionButtonProps): React.JSX.Element {
  return (
    <button
      disabled={disabled}
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
