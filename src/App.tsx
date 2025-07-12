// import { useState } from "react";
import Dashboard from "./components/Dashboard";
// import { auth } from "./firebase";
import "./reset.css";

export default function App() {
  // const [user, setUser] = useState(() => auth.currentUser);

  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, setUser);
  //   return () => unsubscribe();
  // }, []);

  return <Dashboard />;

  // return <>{user ? <YourAppRoutes /> : <Navigate to="/login" />}</>;
}
{
  /* <Route path="/login" element={<LoginRegisterForm />} />; */
}
