import { useNavigate, useParams } from "react-router-dom";
import { getDecksFromStorage } from "../../utils/storage";
import "../styles.css";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { DeckHeader } from "./components/DeckHeader";
import { useMemo } from "react";
import { getDeckTypeSummaryWithDefaults } from "../../utils/decks";
import { CardPreview } from "../Cards/CardPreview";
import { DeckActions } from "./components/DeckActions";

export function DeckPreview() {
  const { deckId } = useParams<{ deckId: string }>();
  const deck = getDecksFromStorage(Number(deckId))[0];
  if (!deck) {
    return <div className="dataContainer">Deck not found</div>;
  }

  const isMobile = useMediaQuery("(max-width: 650px)");
  const navigate = useNavigate();

  const cards = deck.cards || [];
  const summary = useMemo(() => getDeckTypeSummaryWithDefaults(cards), [cards]);

  return (
    <>
      {/* Actions header */}
      <DeckActions
        deck={deck}
        isMobile={isMobile}
        onBack={() => {
          navigate("/decks");
        }}
        onPrimary={() => {
          navigate(`/deck/${deck.id}/edit`);
        }}
      />

      {/* Deck overview */}
      <DeckHeader deck={deck} summary={summary} />

      {/* Deck card list */}
      <CardPreview
        activeCardPreview={undefined}
        deckCards={cards}
        isDeckView={true}
        viewPreference="List"
      />
    </>
  );
}
