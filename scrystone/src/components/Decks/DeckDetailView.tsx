import React, { useEffect, useState } from "react";
import { useDeckParser, getDeckCost } from "../../hooks/useDeckParser";
import type {
  Card,
  CardTypeSummary,
  Deck,
  DeckCard,
} from "../../types/MagicTheGathering";
import { DeckMana } from "./DeckView";
import { CardsView } from "../CardsView";
import { CardSearchBar } from "../CardSearchBar";
import { GiCash } from "react-icons/gi";
import { RiCheckboxCircleFill, RiErrorWarningFill } from "react-icons/ri";
import { useCardParser } from "../../hooks/useCardParser";
import { primaryButton, tertiaryButton } from "../PrimaryActions";
import { FaArrowLeft, FaEdit, FaSave } from "react-icons/fa";

export const DeckDetailView = ({
  deck,
  setCurrentView,
}: {
  deck?: Deck;
  setCurrentView: (view: string) => void;
}): React.JSX.Element => {
  const { cards, onDeckCardAdd } = useCardParser();
  const { getDeckTypeSummaryWithDefaults, onDeckSave } = useDeckParser();

  const hasDeck = deck !== undefined;

  const [summary, setSummary] = useState<CardTypeSummary[]>([]);
  const [editable, setEditable] = useState<Boolean>(!hasDeck);
  const [nameInput, setNameInput] = useState(hasDeck ? deck.name : "");
  const [descriptionInput, setDescriptionInput] = useState(
    hasDeck ? deck.description : ""
  );
  const [formatInput, setFormatInput] = useState(
    hasDeck ? deck.format : "Commander"
  );

  useEffect(() => {
    const result = getDeckTypeSummaryWithDefaults(cards);
    setSummary(result);
  }, [cards]);

  const fields = {
    name: <p className="bold">{hasDeck ? deck.name : "Unnamed Deck"}</p>,
    playStyle: (
      <div className="playStyleTag">
        <p>{deck?.format}</p>
      </div>
    ),
    description: <p>{deck?.description}</p>,
  };

  if (editable) {
    fields.name = (
      <input
        type="text"
        value={nameInput}
        placeholder="Deck name..."
        onChange={(e) => setNameInput(e.target.value)}
      />
    );
    fields.playStyle = (
      <select
        value={formatInput}
        onChange={(e) => setFormatInput(e.target.value)}
      >
        <option value="Commander">Commander</option>
        <option value="Standard">Standard</option>
      </select>
    );
    fields.description = (
      <textarea
        placeholder="Deck description..."
        value={descriptionInput}
        onChange={(e) => setDescriptionInput(e.target.value)}
        rows={3}
      />
    );
  }

  const statusIcon = (cards: DeckCard[] | Card[], deck?: Deck) => {
    const requiredSize = formatInput === "Commander" ? 100 : 60;
    const currentSize = hasDeck ? cards.length : deck?.cards.length || 0;
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
      <div className="actionRow flexRow">
        {tertiaryButton("Cancel and go back", <FaArrowLeft />, () =>
          setCurrentView("deckCollection")
        )}
        {editable
          ? primaryButton("Save", <FaSave />, () => {
              onDeckSave(
                cards,
                nameInput,
                formatInput,
                deck ? deck?.id : undefined,
                descriptionInput
              );
              setEditable(false);
            })
          : primaryButton("Edit", <FaEdit />, () => {
              setEditable(true);
            })}
      </div>
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
            <p className="subtext">${getDeckCost(cards)}</p>
          </div>
          {statusIcon(cards, deck)}
        </div>
      </div>
      {editable && <CardSearchBar onDeckCardAdd={onDeckCardAdd} />}
      <CardsView cards={deck ? deck.cards : cards} />
    </>
  );
};
