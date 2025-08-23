import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import "./reset.css";
import { DeckDashboard } from "./components/Decks/DeckDashboard";
import { DeckEdit } from "./components/Decks/DeckEdit";
import { DeckPreview } from "./components/Decks/DeckPreview";
import { useCardParser } from "./hooks/useCardParser";
import { CardDashboard } from "./components/Cards/CardDashboard";
import { FaUpload } from "react-icons/fa";
import { TbCards } from "react-icons/tb";
import { useMediaQuery } from "./hooks/useMediaQuery";
import { Welcome } from "./components/Welcome/Welcome";
import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { LogInForm } from "./components/Auth/LogInForm";
import { MdLogin } from "react-icons/md";
import { handleLogout } from "./utils/auth";
import { loadBulkCardData } from "./utils/cards";
import { fetchScryfallSetMaps } from "./utils/normalize";
import { NavButton } from "./components/shared/NavButton";
import { ErrorBanner } from "./components/shared/ErrorBanner";

export default function App() {
  const navigate = useNavigate();
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

  if (user === null && location.pathname !== "/" && authChecked) {
    return <Navigate to="/" replace />;
  }

  const getSummaryDescription = () => {
    if (!user) {
      return "Log in to start building decks and to access your collection anywhere.";
    }
    if (hasCollection) {
      return "Your cards are in. Start building decks and see exactly what you own, and what you’ll need.";
    }

    return "Upload your card collection and start brewing with our MTG deck building tools.";
  };

  const hi = true;

  return (
    <div className="container">
      <div className="headingContainer">
        <div className="pageTitle">
          <div>
            <h1>SCRYSTONE</h1>
          </div>
          <div className="flexRow">
            <NavButton
              isActive={location.pathname === "/help"}
              label="Help"
              path="/help"
            />
            <NavButton
              isActive={
                (location.pathname === "/collection" ||
                  (user && location.pathname === "/")) ??
                false
              }
              label="Collection"
              path="/"
              requireLogin={true}
              loginMsg="Please log in to access your collection."
            />
            <NavButton
              isActive={location.pathname.startsWith("/deck")}
              label="Decks"
              path="/decks"
              requireLogin={true}
              loginMsg="Please log in to access your decks."
            />
            {user && (
              <button
                className="navButton navAuthButton"
                onClick={() => handleLogout()}
              >
                <p>
                  <MdLogin />
                  {!isMobile && "Log Out"}
                </p>
              </button>
            )}
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
            <p>{getSummaryDescription()}</p>
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
        className="dataContainer"
        style={{
          opacity: loading ? 0.5 : 1,
          pointerEvents: loading ? "none" : "auto",
          transition: "opacity 0.5s ease",
        }}
      >
        <Routes>
          <Route path="/" element={user ? <CardDashboard /> : <Welcome />} />
          <Route path="/collection" element={<CardDashboard />} />
          <Route path="/decks" element={<DeckDashboard />} />
          <Route path="/deck/:deckId" element={<DeckPreview />} />
          <Route path="/deck/:deckId/edit" element={<DeckEdit />} />
          <Route path="/deck/new" element={<DeckEdit />} />
          <Route path="/help" element={<Welcome />} />
        </Routes>
      </div>
    </div>
  );
}
