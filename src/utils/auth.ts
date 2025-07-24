import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

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

export function isValidPassword(password: string): boolean {
  const minLength = 12;
  const hasNumberOrSpecial = /[\d\W]/;

  return password.length >= minLength && hasNumberOrSpecial.test(password);
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export const handleLogout = async () => {
  try {
    await signOut(auth);
    console.log("User signed out successfully");
    // Optional: redirect or update app state
  } catch (error) {
    console.error("Error signing out:", error);
  }
};
