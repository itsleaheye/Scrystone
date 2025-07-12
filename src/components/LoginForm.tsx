import { useEffect, useState } from "react";
import { loginUser, registerUser } from "../firebaseAuth";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

export const LoginRegisterForm = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { user, loading } = useAuth();
  // const navigate = useNavigate(); // optional

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User signed out successfully");
      // Optional: redirect or update app state
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (isRegistering) {
        if (!isValidPassword(password) || !isValidEmail(email)) {
          setError(
            "Password must be at least 12 characters long and include a number or special character."
          );
          return;
        }

        await registerUser(email, password);
      } else {
        if (!isValidEmail(email)) {
          setError("Please enter a valid email address.");
          return;
        }

        await loginUser(email, password);
      }

      // Optional: navigate to home/dashboard
      // navigate("/");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
  };

  if (loading) return null;
  if (user)
    return (
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white py-2 px-4 rounded-xl hover:bg-red-600"
      >
        Log Out
      </button>
    );

  return (
    <div className="flex justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isRegistering ? "Register" : "Login"}
        </h2>

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

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-xl"
        >
          {isRegistering ? "Create Account" : "Login"}
        </button>

        <p className="text-sm mt-4 text-center">
          {isRegistering
            ? "Already have an account?"
            : "Don’t have an account?"}
          <button
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            className="ml-1 text-blue-600 underline"
          >
            {isRegistering ? "Login" : "Register"}
          </button>
        </p>
      </form>
    </div>
  );
};

function isValidPassword(password: string): boolean {
  const minLength = 12;
  const hasNumberOrSpecial = /[\d\W]/;

  return password.length >= minLength && hasNumberOrSpecial.test(password);
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function useAuth() {
  const [user, setUser] = useState(() => auth.currentUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}
