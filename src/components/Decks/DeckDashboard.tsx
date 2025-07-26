import { DeckView } from "./DeckView";
import { getDecksFromStorage } from "../../utils/storage";
import { EmptyView } from "../shared/EmptyView";
import { DeckActions } from "./components/DeckActions";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Deck } from "../../types/MagicTheGathering";

export function DeckDashboard() {
  const navigate = useNavigate();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadDecks = async () => {
      setLoading(true);

      const data = await getDecksFromStorage();

      setDecks(data);
      setLoading(false);
    };

    loadDecks();
  }, []);

  return (
    <div
      className="contentContainer"
      style={{
        maxWidth: "1600px",
        opacity: loading ? 0.5 : 1,
        pointerEvents: loading ? "none" : "auto",
        transition: "opacity 0.5s ease",
      }}
    >
      {/* Actions header */}
      <DeckActions
        onBack={() => {
          navigate("/");
        }}
        onPrimary={() => {
          navigate(`/deck/new`);
        }}
      />

      {/* Decks list */}
      {decks.length > 0 && !loading ? (
        <div className="grid">
          {decks.map((deck, index) => (
            <DeckView key={index} deck={deck} />
          ))}
        </div>
      ) : (
        <EmptyView
          description="Click on '+ New Deck' to start building..."
          title="No decks found"
        />
      )}
    </div>
  );
}
