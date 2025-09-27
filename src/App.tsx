import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import "./reset.css";
import { auth } from "./firebase";
import { CardDashboard } from "./components/Cards/CardDashboard";
import { DeckDashboard } from "./components/Decks/DeckDashboard";
import { DeckEdit } from "./components/Decks/DeckEdit";
import { DeckPreview } from "./components/Decks/DeckPreview";
import { ErrorBanner } from "./components/shared/ErrorBanner";
import { FaUpload } from "react-icons/fa";
import { fetchScryfallSetMaps } from "./utils/normalize";
import { loadBulkCardData } from "./utils/cards";
import { LogInForm } from "./components/Auth/LogInForm";
import { NavButton } from "./components/shared/NavButton";
import { onAuthStateChanged, type User } from "firebase/auth";
import { TbCards } from "react-icons/tb";
import { useCardParser } from "./hooks/useCardParser";
import { useEffect, useMemo, useState } from "react";
import { useMediaQuery } from "./hooks/useMediaQuery";
import { Welcome } from "./components/Welcome/Welcome";

export default function App() {
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width: 650px)");

  const [user, setUser] = useState(() => auth.currentUser);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  // Preload
  useEffect(() => {
    loadBulkCardData();
    fetchScryfallSetMaps();
  }, []);

  const {
    currentProgress,
    error,
    loading,
    totalProgress,
    collection,
    onCollectionUpload,
  } = useCardParser();

  const hasCollection = collection.size > 0;

  const summaryDescription = useMemo(() => {
    if (!user)
      return "Log in to start building decks and to access your collection anywhere.";
    if (hasCollection)
      return "Your cards are in. Start building decks and see exactly what you own, and what you’ll need.";
    return "Upload your card collection and start brewing with our MTG deck building tools.";
  }, [user, hasCollection]);

  if (user === null && location.pathname !== "/" && authChecked) {
    return <Navigate to="/" replace />;
  }

  const navItems = [
    {
      label: "Help",
      path: "/help",
    },
    {
      label: "Collection",
      path: "/",
      requireLogin: true,
    },
    {
      label: "Decks",
      path: "/decks",
      requireLogin: true,
    },
  ];

  return (
    <div className="container">
      <div className="headingContainer">
        <div className="pageTitle">
          <div>
            <h1>SCRYSTONE</h1>
          </div>
          <div className="flexRow">
            {navItems.map((navItem) => {
              return (
                <NavButton
                  key={navItem.label}
                  isActive={
                    navItem.path === "/"
                      ? location.pathname === "/"
                      : location.pathname.startsWith(navItem.path)
                  }
                  label={navItem.label}
                  path={navItem.path}
                  requireLogin={navItem.requireLogin}
                />
              );
            })}
            {user && <NavButton label={"Log Out"} />}
          </div>
        </div>
        <div className="summaryContainer flexRow">
          <div className="flexCol">
            {isMobile && (
              <div className="summaryIcon">
                <TbCards />
              </div>
            )}
            <h2>
              {user
                ? "Build Powerful Decks From Your Collection"
                : "Getting Started"}
            </h2>
            <p>{summaryDescription}</p>
            {user ? (
              <div className="uploadContainer">
                <input
                  className="hidden"
                  id="fileInput"
                  type="file"
                  accept=".csv, .txt"
                  onChange={onCollectionUpload}
                  disabled={loading}
                />
                <label htmlFor="fileInput">
                  <FaUpload className="uploadIcon" />
                  {hasCollection ? "Sync Cards" : "Upload Cards"}
                </label>
              </div>
            ) : (
              <LogInForm />
            )}
            {hasCollection && user && (
              <p className="subtext">Last synced {collection.updatedAt}</p>
            )}
          </div>
          {!isMobile && (
            <div className="summaryIcon">
              <TbCards />
            </div>
          )}
        </div>
      </div>

      {error && (
        <ErrorBanner message="Error loading cards: Try uploading your .csv file again" />
      )}

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p className="text-center">
            {currentProgress !== totalProgress || currentProgress === 0
              ? `Loading ${currentProgress}/${totalProgress} cards`
              : "Wrapping up some final details..."}
          </p>
        </div>
      )}

      <div
        className={`dataContainer transition-opacity duration-500 ${
          loading ? "opacity-50 pointer-events-none" : "opacity-100"
        }`}
      >
        <AppRoutes user={user} />
      </div>
    </div>
  );
}

interface AppRoutesProps {
  user: User | null;
}

function AppRoutes({ user }: AppRoutesProps) {
  const routes = [
    { path: "/", element: user ? <CardDashboard /> : <Welcome /> },
    { path: "/collection", element: <CardDashboard /> },
    { path: "/deck/:deckId", element: <DeckPreview /> },
    { path: "/deck/:deckId/edit", element: <DeckEdit /> },
    { path: "/deck/new", element: <DeckEdit /> },
    { path: "/decks", element: <DeckDashboard /> },
    { path: "/help", element: <Welcome /> },
  ];

  return (
    <Routes>
      {routes.map((route) => (
        <Route path={route.path} element={route.element} />
      ))}
    </Routes>
  );
}
