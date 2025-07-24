import { useNavigate } from "react-router-dom";
import { isValidEmail, isValidPassword, useAuth } from "../../utils/auth";
import { useState } from "react";
import { loginUser, registerUser } from "../../firebaseAuth";

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
    <div className="text-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm"
      >
        {error && (
          <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {isSignUp && (
          <input
            type="password"
            placeholder="Verify password..."
            value={verifyPassword}
            required
            onChange={(e) => setVerifyPassword(e.target.value)}
            className="w-full mb-4 p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        )}

        <div className="flexRow">
          <button className="authButton" type="submit">
            {isSignUp ? "Sign Up" : "Log In"}
          </button>
          <p className="text-sm mt-4 text-center">
            <a
              onClick={() => setIsSignUp(!isSignUp)}
              className="ml-1 text-blue-600 underline"
            >
              {isSignUp ? "Or Log In" : "Or Sign Up"}
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
