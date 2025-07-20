import { DeckView } from "./DeckView";
import { getDecksFromStorage } from "../../utils/storage";
import { EmptyView } from "../shared/EmptyView";
import { DeckActions } from "./components/DeckActions";
import { useNavigate } from "react-router-dom";

export function DeckDashboard() {
  const decks = getDecksFromStorage();
  const navigate = useNavigate();

  return (
    <div className="p-[var(--pad-sm)] mx-auto" style={{ maxWidth: "1600px" }}>
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
