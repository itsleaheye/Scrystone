import React, { useEffect, useState } from "react";
import { useDeckParser } from "../../hooks/useDeckParser";
import type {
  Card,
  CardTypeSummary,
  Deck,
  DeckCard,
  MissingCard,
} from "../../types/MagicTheGathering";
import { DeckMana } from "./Deck";
import { CardsView } from "../CardsView";
import { CardSearchBar } from "../CardSearchBar";
import { GiCash } from "react-icons/gi";
import { RiCheckboxCircleFill, RiErrorWarningFill } from "react-icons/ri";
import { useCardParser } from "../../hooks/useCardParser";

export const DeckView = ({
  deck,
  isEditable,
}: {
  deck?: Deck;
  isEditable: boolean;
}): React.JSX.Element => {
  const { cards, onDeckCardAdd } = useCardParser();
  const { getDeckTypeSummaryWithDefaults } = useDeckParser();
  const [format, setFormat] = useState("Commander");
  const [summary, setSummary] = useState<CardTypeSummary[]>([]);

  useEffect(() => {
    const result = getDeckTypeSummaryWithDefaults(cards);
    setSummary(result);
  }, [cards]);

  const deckCost = cards.reduce(
    (sum, card) =>
      sum +
      (typeof card.price === "number" ? card.price : Number(card.price) || 0),
    0
  );

  if (deck && deck.cards && deck.cards.length === 0) {
    return <CardsView cards={deck.cards} />;
  }

  const fields = {
    name: <p>{deck?.name}</p>,
    playStyle: (
      <div className="playStyleTag">
        <p>{deck?.format}</p>
      </div>
    ),
    description: <p>{deck?.description}</p>,
  };

  if (isEditable) {
    fields.name = <input type="text" placeholder="Deck name..." />;
    fields.playStyle = (
      <select value={format} onChange={(e) => setFormat(e.target.value)}>
        <option value="Commander">Commander</option>
        <option value="Standard">Standard</option>
      </select>
    );
    fields.description = (
      <textarea placeholder="Deck description..." rows={3} />
    );
  }

  const statusIcon = (
    cards: DeckCard[] | Card[] | MissingCard[],
    deck?: Deck
  ) => {
    const requiredSize = format === "Commander" ? 100 : 60;
    const currentSize = isEditable ? cards.length : deck?.cards.length || 0;
    const isReady = deck && currentSize >= requiredSize;

    return (
      <div className="iconItem">
        {isReady ? <RiCheckboxCircleFill /> : <RiErrorWarningFill />}
        <p>{isReady ? "Deck is ready" : "Deck not ready"}</p>
        <p className="subtext">
          {currentSize}/{requiredSize} Cards
        </p>
      </div>
    );
  };

  return (
    <>
      <div className="deckOverview flexRow">
        <div className="flexRow">
          <div>
            {deck?.colours ? (
              <DeckMana colours={deck?.colours} />
            ) : (
              <div className="flexRow manaRow">
                <span className="manaPlaceholder" />
                <span className="manaPlaceholder" />
                <span className="manaPlaceholder" />
                <span className="manaPlaceholder" />
                <span className="manaPlaceholder" />
              </div>
            )}
            <div className="flexRow">
              {fields.name}
              {fields.playStyle}
            </div>
            {fields.description}
          </div>
          <div className="deckCardSummary">
            <ul>
              {summary.map(({ type, quantityNeeded, quantityOwned }) => (
                <li key={type}>
                  {type} {quantityOwned}/{quantityNeeded}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="deckBreakdown flexRow">
          <div className="iconItem">
            <GiCash />
            <p>Deck Cost</p>
            <p className="subtext">${deckCost.toFixed(2)}</p>
          </div>
          {statusIcon(cards, deck)}
        </div>
      </div>
      {isEditable && <CardSearchBar onDeckCardAdd={onDeckCardAdd} />}
      <CardsView cards={isEditable ? cards : deck?.cards} />
    </>
  );
};
