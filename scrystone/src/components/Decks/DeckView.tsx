import React, { useState } from "react";
import { useDeckParser } from "../../hooks/useDeckParser";
import type { Deck } from "../../types/MagicTheGathering";
import { DeckMana } from "./Deck";
import { CardsView } from "../CardsView";
import { CardSearchBar } from "../CardSearchBar";
import { GiCash } from "react-icons/gi";
import { RiCheckboxCircleFill, RiErrorWarningFill } from "react-icons/ri";

export const DeckView = ({
  deck,
  isEditable,
}: {
  deck?: Deck;
  isEditable: boolean;
}): React.JSX.Element => {
  const { onCreateDeck } = useDeckParser();
  const [format, setFormat] = useState("Commander");

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

  const statusIcon = (deck?: Deck) => {
    const requiredSize = format === "Commander" ? 100 : 60;
    const currentSize = deck?.cards.length || 0;
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
              <li>Creatures 0/0</li>
              <li>Instants 0/0</li>
              <li>Enchantments 0/0</li>
              <li>Land 0/0</li>
            </ul>
          </div>
        </div>
        <div className="deckBreakdown flexRow">
          <div className="iconItem">
            <GiCash />
            <p>Deck Cost</p>
            <p className="subtext">${(deck?.value || 0).toFixed(2)}</p>
          </div>
          {statusIcon(deck)}
        </div>
      </div>
      {isEditable && <CardSearchBar deck={deck} />}
      {/* Figure out the UI how to add cards to deck
      Fetch all cards in thedeck and display them */}
      <CardsView cards={deck?.cards} />
    </>
  );
};
