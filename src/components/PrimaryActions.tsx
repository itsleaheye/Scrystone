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
  return (
    <button className="primaryButton" onClick={onClick}>
      {icon}
      {label}
    </button>
  );
};

export const destroyButton = (
  label: string,
  icon: React.ReactNode,
  isMobile: boolean,
  onClick: () => void
): React.JSX.Element => {
  return (
    <button className="destroyButton" onClick={onClick}>
      {icon}
      {!isMobile && label}
    </button>
  );
};
