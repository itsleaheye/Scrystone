import { useLocation, useNavigate } from "react-router-dom";
import { handleLogout, useAuth } from "../../utils/auth";
import { MdLogin } from "react-icons/md";
import { useMediaQuery } from "../../hooks/useMediaQuery";

interface NavButtonProps {
  isActive?: boolean;
  label: string;
  loginMsg?: string;
  path?: string;
  requireLogin?: boolean;
}

export function NavButton({
  isActive = false,
  label,
  loginMsg,
  path,
  requireLogin = false,
}: NavButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isMobile = useMediaQuery("(max-width: 650px)");

  const showConfirmation =
    location.pathname.includes("/new") || location.pathname.includes("/edit");

  const navigateWithConfirm = (
    path?: string,
    requireLogin = false,
    loginMsg?: string
  ) => {
    if (requireLogin && !user) {
      alert(loginMsg || "Please log in.");
      return;
    }
    if (showConfirmation && !window.confirm("Discard changes?")) return;

    if (!path) return;
    navigate(path);
  };

  const isAuthButton = label === "Log Out";

  return (
    <button
      className={`navButton ${isActive && "isActive"} ${
        isAuthButton && "navAuthButton"
      }`}
      onClick={() =>
        isAuthButton
          ? handleLogout()
          : navigateWithConfirm(path, requireLogin ?? false, loginMsg)
      }
    >
      <p>
        {isAuthButton && <MdLogin />}
        {(isAuthButton && !isMobile) || !isAuthButton ? label : ""}
      </p>
    </button>
  );
}
