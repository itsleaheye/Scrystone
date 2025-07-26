import { useNavigate } from "react-router-dom";
import { isValidEmail, isValidPassword, useAuth } from "../../utils/auth";
import { useState } from "react";
import { loginUser, registerUser } from "../../firebaseAuth";
import "./Auth.css";
import { MdLogin } from "react-icons/md";

export function LogInForm() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (loading) return null;

  if (user) {
    navigate("/");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (!isValidPassword(password) || !isValidEmail(email)) {
        setError(
          isSignUp
            ? "Password must be at least 12 characters long and include a number or special character."
            : "Invalid password."
        );
        return;
      }
      if (!isValidEmail(email)) {
        setError("Please enter a valid email address.");
        return;
      }

      if (isSignUp) {
        if (password != verifyPassword) {
          setError("Password verification must match");
        }
        await registerUser(email, password);
        setIsSignUp(false);
      }

      await loginUser(email, password);
      navigate("/");
    } catch (error: any) {
      setError(error.message || "Something went wrong. Try again");
    }
  };

  return (
    <div className="text-center authForm">
      <form onSubmit={handleSubmit}>
        {error && (
          <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          className="authInput"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
          className="authInput"
        />

        {isSignUp && (
          <input
            type="password"
            placeholder="Verify Password"
            value={verifyPassword}
            required
            onChange={(e) => setVerifyPassword(e.target.value)}
            className="authInput"
          />
        )}

        <div className="flexRow">
          <button className="authButton" type="submit">
            {!isSignUp && <MdLogin />}
            {isSignUp ? "Sign Up" : "Log In"}
          </button>
          <button
            className="text-sm mt-4 text-center authSecondaryButton"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "Or Log In" : "Or Sign Up"}
          </button>
        </div>
      </form>
    </div>
  );
}
