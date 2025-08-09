import { DeckView } from "./DeckView";
import { getDecksFromStorage } from "../../utils/storage";
import { EmptyView } from "../shared/EmptyView";
import { DashboardActions } from "./components/Actions";
import { useEffect, useState } from "react";
import type { Deck } from "../../types/MagicTheGathering";
import { useDeckFiltersAndSort } from "../../hooks/useDeckFiltersAndSort";

export function DeckDashboard() {
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

  const { filteredAndSortedDecks, filters, setFilters } =
    useDeckFiltersAndSort(decks);

  return (
    <div className="contentContainer">
      {/* Actions header */}
      <span
        style={{
          maxWidth: "1600px",
          opacity: loading ? 0.5 : 1,
          pointerEvents: loading ? "none" : "auto",
          transition: "opacity 0.5s ease",
        }}
      >
        <DashboardActions filters={filters} setFilters={setFilters} />
      </span>

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p className="text-center">Loading decks...</p>
        </div>
      )}

      {/* Decks list */}
      {filteredAndSortedDecks.length > 0 && !loading ? (
        <div className="grid">
          {filteredAndSortedDecks.map((deck, index) => (
            <DeckView key={index} deck={deck} />
          ))}
        </div>
      ) : (
        !loading && (
          <EmptyView
            description="Click on '+ New Deck' to start building..."
            title="No decks found"
          />
        )
      )}
    </div>
  );
}
