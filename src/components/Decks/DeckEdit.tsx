import { useNavigate, useParams } from "react-router-dom";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { DeckActions } from "./components/DeckActions";
import type { Deck } from "../../types/MagicTheGathering";
import { useDeckParser } from "../../hooks/useDeckParser";
import { useDeckFormState } from "../../hooks/useDeckFormState";
import { useCardParser } from "../../hooks/useCardParser";
import { DeckHeader } from "./components/DeckHeader";
import { useEffect, useMemo, useState } from "react";
import { getDeckTypeSummaryWithDefaults } from "../../utils/decks";
import { CardPreview } from "../Cards/CardPreview";
import { ViewStyleFilter } from "../shared/ViewStyleFilter";
import { CardSearchBar } from "../shared/CardSearchBar";
import { getDecksFromStorage } from "../../utils/storage";

export function DeckEdit() {
  const { deckId } = useParams<{ deckId: string }>();
  const [deck, setDeck] = useState<Deck | undefined>();
  const [viewStyle, setViewStyle] = useState<string>("List");

  useEffect(() => {
    if (deckId !== undefined) {
      const foundDeck = getDecksFromStorage(Number(deckId))[0];
      setDeck(foundDeck);

      if (foundDeck) {
        setCards(foundDeck.cards);
      }
    }
  }, [deckId]);

  const editable = deck !== undefined;
  const { cards, onDeckCardAdd, setCards } = useCardParser();

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

  const summary = useMemo(() => getDeckTypeSummaryWithDefaults(cards), [cards]);

  return (
    <>
      {/* Actions header */}
      <DeckActions
        deck={deck}
        editable={editable || location.pathname.includes("/deck/new")}
        isMobile={isMobile}
        onBack={() => {
          if (window.confirm("Are you sure you want to delete this deck?")) {
            navigate(editable ? `/deck/${deck.id}` : "/decks");
          }
        }}
        onPrimary={() => {
          const savedDeck = onDeckSave(
            cards,
            name,
            format,
            deck?.id,
            description
          );
          navigate(`/deck/${savedDeck.id}`);
        }}
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
      <div className="deckCardActions">
        <ViewStyleFilter
          isMobile={isMobile}
          setViewStyle={setViewStyle}
          viewStyle={viewStyle}
        />
        <CardSearchBar onDeckCardAdd={onDeckCardAdd} deckCards={cards} />
      </div>

      {/* Deck card list */}
      <CardPreview
        activeCardPreview={!isMobile ? cards[cards.length - 1] : undefined}
        deckCards={cards}
        editable={true}
        isDeckView={true}
        setCards={setCards}
        viewPreference={viewStyle}
      />
    </>
  );
}
