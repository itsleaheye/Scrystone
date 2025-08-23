import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/auth";

interface NavButtonProps {
  isActive: boolean;
  label: string;
  loginMsg?: string;
  path: string;
  requireLogin?: boolean;
}

export function NavButton({
  isActive,
  label,
  loginMsg,
  path,
  requireLogin = false,
}: NavButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const showConfirmation =
    location.pathname.includes("/new") || location.pathname.includes("/edit");

  const navigateWithConfirm = (
    path: string,
    requireLogin = false,
    loginMsg?: string
  ) => {
    if (requireLogin && !user) {
      alert(loginMsg || "Please log in.");
      return;
    }
    if (showConfirmation && !window.confirm("Discard changes?")) return;
    navigate(path);
  };

  return (
    <button
      className={`navButton ${isActive ? "isActive" : ""}`}
      onClick={() => navigateWithConfirm(path, requireLogin ?? false, loginMsg)}
    >
      <p>{label}</p>
    </button>
  );
}
