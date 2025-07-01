import { useMediaQuery } from "../hooks/useMediaQuery";
import "./styles.css";

export const tertiaryButton = (
  label: string,
  icon: React.ReactNode,
  onClick: () => void
): React.JSX.Element => {
  return (
    <a className="tertiaryButton" onClick={onClick}>
      {icon}
      {label}
    </a>
  );
};

export const primaryButton = (
  label: string,
  icon: React.ReactNode,
  onClick: () => void
): React.JSX.Element => {
  const isMobile = useMediaQuery("(max-width: 500px)");

  return (
    <button className="primaryButton" onClick={onClick}>
      {icon}
      {!isMobile && label}
    </button>
  );
};
