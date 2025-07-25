import { useNavigate, useParams } from "react-router-dom";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { DeckActions } from "./components/DeckActions";
import type { CardTypeSummary, Deck } from "../../types/MagicTheGathering";
import { useDeckParser } from "../../hooks/useDeckParser";
import { useDeckFormState } from "../../hooks/useDeckFormState";
import { useCardParser } from "../../hooks/useCardParser";
import { DeckHeader } from "./components/DeckHeader";
import { useEffect, useState } from "react";
import { getDeckTypeSummaryWithDefaults } from "../../utils/decks";
import { CardPreview } from "../Cards/CardPreview";
import { ViewStyleFilter } from "../shared/ViewStyleFilter";
import { CardSearchBar } from "../shared/CardSearchBar";
import { getDecksFromStorage } from "../../utils/storage";
import "../styles.css";

export function DeckEdit() {
  const { deckId } = useParams<{ deckId: string }>();
  const { cards, onDeckCardAdd, setCards, onCardsImport, loading } =
    useCardParser();

  const [deck, setDeck] = useState<Deck | undefined>();
  const [viewStyle, setViewStyle] = useState<string>("List");

  useEffect(() => {
    if (deckId == undefined) return;

    async function loadDeck() {
      try {
        const decks = await getDecksFromStorage(Number(deckId));
        const foundDeck = decks[0];
        setDeck(foundDeck);

        if (foundDeck) {
          setCards(foundDeck.cards);
        }
      } catch (error) {
        console.error("Failed to load deck:", error);

        setDeck(undefined);
      }
    }

    loadDeck();
  }, [deckId, setCards]);

  const editable = deck !== undefined;

  useEffect(() => {
    if (deck && deck.cards) {
      setCards(deck.cards);
    }
  }, [deck]);

  const isMobile = useMediaQuery("(max-width: 650px)");
  const navigate = useNavigate();

  const { onDeckSave, isValidFormat } = useDeckParser();
  const { name, setName, description, setDescription, format, setFormat } =
    useDeckFormState(deck);

  const [summary, setSummary] = useState<CardTypeSummary[]>([]);
  useEffect(() => {
    async function loadSummary() {
      let summaryResult = await getDeckTypeSummaryWithDefaults(cards);
      setSummary(summaryResult);
    }
    loadSummary();
  }, [cards, editable, deck]);

  return (
    <div className="contentContainer" style={{ maxWidth: "1600px" }}>
      {/* Actions header */}
      <DeckActions
        deck={deck}
        editable={editable || location.pathname.includes("/deck/new")}
        isMobile={isMobile}
        onBack={() => {
          if (window.confirm("Discard changes and go back?")) {
            navigate(editable ? `/deck/${deck.id}` : "/decks");
          }
        }}
        onPrimary={async () => {
          console.log(cards, name, format, deck?.id, description);
          const savedDeck = await onDeckSave(
            cards,
            name,
            format,
            deck?.id,
            description
          );

          if (savedDeck) {
            navigate(`/deck/${savedDeck.id}`);
          } else {
            console.error("Failed to save. Try again.");
          }
        }}
        onCardsImport={onCardsImport}
        loading={loading}
      />

      {/* Deck overview */}
      <DeckHeader
        deck={deck}
        formDetails={{
          name,
          setName,
          description,
          setDescription,
          format,
          setFormat,
          isValidFormat,
        }}
        cards={cards}
        summary={summary}
      />

      {/* Search bar and results */}
      <div
        className="deckCardActions"
        style={{
          opacity: loading ? 0.5 : 1,
          pointerEvents: loading ? "none" : "auto",
          transition: "opacity 0.5s ease",
        }}
      >
        <ViewStyleFilter
          isMobile={isMobile}
          setViewStyle={setViewStyle}
          viewStyle={viewStyle}
        />
        <CardSearchBar onDeckCardAdd={onDeckCardAdd} deckCards={cards} />
      </div>

      {/* Deck card list */}
      <span
        style={{
          opacity: loading ? 0.5 : 1,
          pointerEvents: loading ? "none" : "auto",
          transition: "opacity 0.5s ease",
        }}
      >
        <CardPreview
          activeCardPreview={!isMobile ? cards[cards.length - 1] : undefined}
          deckCards={cards}
          editable={true}
          isDeckView={true}
          setCards={setCards}
          viewPreference={viewStyle}
        />
      </span>
    </div>
  );
}
