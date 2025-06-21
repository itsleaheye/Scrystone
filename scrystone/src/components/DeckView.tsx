import React from "react";
import { useDeckParser } from "../hooks/useDeckParser";
import type { Deck } from "../types/MagicTheGathering";
import { DeckMana } from "./Deck";
import { CardsView } from "./CardsView";

export const DeckView = ({
  deck,
  isEditable,
}: {
  deck?: Deck;
  isEditable: boolean;
}): React.JSX.Element => {
  const { onCreateDeck } = useDeckParser();

  if (deck && deck.cards && deck.cards.length === 0) {
    return <CardsView cards={deck.cards} />;
  }

  const fields = {
    name: <p>{deck?.name}</p>,
    playStyle: (
      <div className="playStyleTag">
        <p>{deck?.playStyle}</p>
      </div>
    ),
    description: <p>{deck?.description}</p>,
  };

  if (isEditable) {
    fields.name = <input type="text" placeholder="Deck Name" />;
    fields.playStyle = (
      <select>
        <option value="Commander">Commander</option>
        <option value="Standard">Standard</option>
      </select>
    );
    fields.description = <textarea placeholder="Deck Description" rows={3} />;
  }

  return (
    <>
      <div className="deckOverview">
        <div>
          {deck?.colours && <DeckMana colours={deck?.colours} />}
          <div className="flexRow">
            {fields.name}
            {fields.playStyle}
          </div>
          {fields.description}
        </div>
        <div>{/* Summary CardDetailRow*/}</div>
        <div>{/* Cost and ready state */}</div>
      </div>
      {isEditable && <button> Add Card</button>}
      {/* Figure out the UI how to add cards to deck
      Fetch all cards in thedeck and display them */}
    </>
  );
};
