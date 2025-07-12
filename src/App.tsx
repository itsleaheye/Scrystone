import { Route, Routes } from "react-router-dom";
import "./reset.css";
import { DeckDashboard } from "./components/Decks/DeckDashboard";
import { DeckEdit } from "./components/Decks/DeckEdit";
import { DeckPreview } from "./components/Decks/DeckPreview";
import { useCardParser } from "./hooks/useCardParser";
import { CardDashboard } from "./components/Cards/CardDashboard";
import SiteHeader from "./components/SiteHeader";

export default function App() {
  const { currentProgress, error, loading, totalProgress } = useCardParser();

  return (
    <div className="container">
      <SiteHeader />

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
