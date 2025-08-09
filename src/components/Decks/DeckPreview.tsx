import { useNavigate, useParams } from "react-router-dom";
import { getDecksFromStorage } from "../../utils/storage";
import "../styles.css";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { DeckHeader } from "./components/DeckHeader";
import { useEffect, useState } from "react";
import { getDeckTypeSummaryWithDefaults } from "../../utils/decks";
import { CardPreview } from "../Cards/CardPreview";
import { DeckActions } from "./components/DeckActions";
import type { CardTypeSummary, Deck } from "../../types/MagicTheGathering";
import { ImSpinner6 } from "react-icons/im";
import { DeckHeaderLoading } from "./components/DeckHeaderLoading";

export function DeckPreview() {
  const { deckId } = useParams<{ deckId: string }>();
  const [deck, setDeck] = useState<Deck | undefined>();

  useEffect(() => {
    if (deckId == undefined) return;

    async function loadDeck() {
      try {
        const decks = await getDecksFromStorage(Number(deckId));
        const foundDeck = decks[0];

        if (foundDeck) {
          setDeck(foundDeck);
        }
      } catch (error) {
        console.error("Failed to load deck:", error);

        return (
          <div className="dataContainer">
            Error: Deck not found. Please go back and select a different deck.
          </div>
        );
      }
    }

    loadDeck();
  }, [deckId]);

  const isMobile = useMediaQuery("(max-width: 650px)");
  const navigate = useNavigate();

  const cards = deck?.cards || [];
  const [summary, setSummary] = useState<CardTypeSummary[]>([]);

  useEffect(() => {
    async function loadSummary() {
      let summaryResult = await getDeckTypeSummaryWithDefaults(cards);
      setSummary(summaryResult);
    }
    loadSummary();
  }, [cards, deck]);

  return (
    <div className="contentContainer" style={{ maxWidth: "1600px" }}>
      {/* Actions header */}
      <DeckActions
        deck={deck}
        isMobile={isMobile}
        onBack={() => {
          navigate("/decks");
        }}
        onPrimary={() => {
          navigate(`/deck/${deck?.id}/edit`);
        }}
      />

      {/* Deck overview */}
      {deck ? (
        <DeckHeader deck={deck} summary={summary} />
      ) : (
        <DeckHeaderLoading />
      )}

      {/* Deck card list */}
      {deck && (
        <CardPreview
          activeCardPreview={undefined}
          deckCards={cards}
          isDeckView={true}
          viewPreference="List"
        />
      )}
    </div>
  );
}
