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

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width: 650px)");

  const [user, setUser] = useState(() => auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
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
  const showConfirmation =
    location.pathname.includes("/new") || location.pathname.includes("/edit");

  if (user === null && location.pathname !== "/") {
    return <Navigate to="/" replace />;
  }

  let summaryDescription = hasCollection
    ? "Your cards are in. Start building decks and see exactly what you own, and what you’ll need."
    : "Upload your card collection and start brewing with our MTG deck building tools.";

  if (!user) {
    summaryDescription =
      "Log in to start building decks and to access your collection anywhere.";
  }

  return (
    <div className="container">
      <div className="headingContainer">
        <div className="pageTitle">
          <div>
            <h1>SCRYSTONE</h1>
          </div>
          <div className="flexRow">
            <button
              className={`navButton ${
                (!user && location.pathname === "/") ||
                location.pathname === "/how-it-works"
                  ? "isActive"
                  : ""
              }`}
              onClick={() => {
                if (showConfirmation && window.confirm("Discard changes?")) {
                  navigate("/how-it-works");
                }
                if (!showConfirmation) {
                  navigate("/how-it-works");
                }
              }}
            >
              <p>How it Works</p>
            </button>
            <button
              className={`navButton ${
                location.pathname === "/collection" ||
                (user && location.pathname === "/")
                  ? "isActive"
                  : ""
              }`}
              onClick={() => {
                if (showConfirmation && window.confirm("Discard changes?")) {
                  navigate("/");
                }
                if (!showConfirmation) {
                  navigate("/");
                }
              }}
            >
              <p>Collection</p>
            </button>
            <button
              className={`navButton ${
                location.pathname.startsWith("/deck") ? "isActive" : ""
              }`}
              onClick={() => {
                if (showConfirmation && window.confirm("Discard changes?")) {
                  navigate("/decks");
                }
                if (!showConfirmation) {
                  navigate("/decks");
                }
              }}
            >
              <p>Decks</p>
            </button>
            {user && (
              <button
                className="navButton navAuthButton"
                onClick={() => handleLogout()}
              >
                <p>
                  <MdLogin />
                  Log Out
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
            <p>{summaryDescription}</p>
            {user ? (
              <div className="uploadContainer">
                <input
                  className="hidden"
                  id="fileInput"
                  type="file"
                  accept=".csv"
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
            {hasCollection && (
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
        <div>
          <p>Error loading cards: Try uploading your .csv file again</p>
        </div>
      )}

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p className="text-center">
            Loading {currentProgress}/{totalProgress} cards
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
          <Route path="/how-it-works" element={<Welcome />} />
        </Routes>
      </div>
    </div>
  );
}
