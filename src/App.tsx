import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import "./reset.css";
import { DeckDashboard } from "./components/Decks/DeckDashboard";
import { DeckEdit } from "./components/Decks/DeckEdit";
import { DeckPreview } from "./components/Decks/DeckPreview";
import { useCardParser } from "./hooks/useCardParser";
import { CardDashboard } from "./components/Cards/CardDashboard";
import { WalletIcon, ArrowUpTrayIcon } from "@heroicons/react/16/solid";
import { GiCash } from "react-icons/gi";
import { TbCardsFilled } from "react-icons/tb";
import { IconItem } from "./components/shared/IconItem";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

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

  return (
    <div className="container">
      <div className="headingContainer">
        <div className="pageTitle">
          <h1>SCRYSTONE</h1>
          <p>A Magic the Gathering collection tool</p>
        </div>

        <div className="summaryContainer">
          <div className="flexRow borderBottom">
            <IconItem
              icon={<GiCash />}
              text={`Value: $${Math.round(collection.value)}`}
              onClick={() => alert("Price breakdown will be coming in V2")}
            />
            <IconItem
              isActive={location.pathname === "/"}
              icon={<TbCardsFilled />}
              text={`Collection`}
              onClick={() => {
                if (showConfirmation && window.confirm("Discard changes?")) {
                  navigate("/");
                }
                if (!showConfirmation) {
                  navigate("/");
                }
              }}
            />
            <IconItem
              isActive={location.pathname.startsWith("/deck")}
              icon={<WalletIcon />}
              text={`Decks`}
              onClick={() => {
                if (showConfirmation && window.confirm("Discard changes?")) {
                  navigate("/decks");
                }
                if (!showConfirmation) {
                  navigate("/decks");
                }
              }}
            />
          </div>

          <div className="uploadContainer">
            <input
              className="hidden"
              id="fileInput"
              type="file"
              accept=".csv"
              onChange={onCollectionUpload}
            />
            <label htmlFor="fileInput">
              <ArrowUpTrayIcon className="uploadIcon" />
              {hasCollection ? "Sync Cards" : "Upload Your Cards"}
            </label>
            <p className="subtext">
              {hasCollection
                ? `Last synced on ${collection.updatedAt}`
                : "Never synced yet"}
            </p>
          </div>
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
          <Route path="/" element={<CardDashboard />} />
          <Route path="/decks" element={<DeckDashboard />} />
          <Route path="/deck/:deckId" element={<DeckPreview />} />
          <Route path="/deck/:deckId/edit" element={<DeckEdit />} />
          <Route path="/deck/new" element={<DeckEdit />} />
        </Routes>
      </div>
    </div>
  );
}
