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
  useEffect(() => {
    getDecksFromStorage()
      .then((data) => {
        setDecks(data);
      })
      .catch(() => {
        setDecks([]);
      });
  }, []);

  return (
    <div className="contentContainer" style={{ maxWidth: "1600px" }}>
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
      {decks.length > 0 ? (
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
