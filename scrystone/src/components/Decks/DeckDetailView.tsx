import React, { useEffect, useState } from "react";
import {
  useDeckParser,
  getDeckCost,
  getDecksFromStorage,
} from "../../hooks/useDeckParser";
import type {
  Card,
  CardTypeSummary,
  Deck,
  DeckCard,
} from "../../types/MagicTheGathering";
import { DeckMana } from "./DeckView";
import { CardSearchBar } from "../CardSearchBar";
import { GiCash } from "react-icons/gi";
import { RiCheckboxCircleFill, RiErrorWarningFill } from "react-icons/ri";
import { useCardParser } from "../../hooks/useCardParser";
import { primaryButton, tertiaryButton } from "../PrimaryActions";
import { FaArrowLeft, FaEdit, FaSave } from "react-icons/fa";
import { CardListView } from "../Cards/CardListView";

export const DeckDetailView = ({
  deckId,
  setCurrentView,
}: {
  deckId?: number;
  setCurrentView: (view: string) => void;
}): React.JSX.Element => {
  const { cards, onDeckCardAdd, setCards } = useCardParser();

  const { getDeckTypeSummaryWithDefaults, onDeckSave } = useDeckParser();
  const [activeDeck, setActiveDeck] = useState<Deck | undefined>();

  useEffect(() => {
    if (deckId !== undefined) {
      const foundDeck = getDecksFromStorage(deckId)[0];
      setActiveDeck(foundDeck);
      if (foundDeck) {
        setCards(foundDeck.cards);
        setNameInput(foundDeck.name);
        setDescriptionInput(foundDeck.description);
        setFormatInput(foundDeck.format);
      }
    }
  }, [deckId]);

  const [summary, setSummary] = useState<CardTypeSummary[]>([]);
  const [editable, setEditable] = useState<boolean>(deckId === undefined);
  const [nameInput, setNameInput] = useState(activeDeck ? activeDeck.name : "");
  const [descriptionInput, setDescriptionInput] = useState(
    activeDeck ? activeDeck.description : ""
  );
  const [formatInput, setFormatInput] = useState(
    activeDeck ? activeDeck.format : "Commander"
  );

  useEffect(() => {
    const result = getDeckTypeSummaryWithDefaults(
      editable ? cards : activeDeck?.cards || []
    );
    setSummary(result);
  }, [cards, editable, activeDeck]);

  const fields = {
    name: (
      <p className="bold">{activeDeck ? activeDeck.name : "Unnamed Deck"}</p>
    ),
    playStyle: (
      <div className="playStyleTag">
        <p>{activeDeck?.format}</p>
      </div>
    ),
    description: <p>{activeDeck?.description}</p>,
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
        onChange={(e) =>
          setFormatInput(
            e.target.value == "Commander" ? "Commander" : "Standard"
          )
        }
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
    const currentSize = activeDeck
      ? activeDeck.cards.length
      : cards.length || 0;
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
        {tertiaryButton(
          editable ? "Cancel and go back" : "Go back",
          <FaArrowLeft />,
          () => setCurrentView("deckCollection")
        )}
        {editable
          ? primaryButton("Save", <FaSave />, () => {
              console.log("HIT SAVE", cards);
              const savedDeck = onDeckSave(
                cards,
                nameInput,
                formatInput,
                activeDeck?.id,
                descriptionInput
              );

              setActiveDeck(savedDeck);
              setEditable(false);
            })
          : primaryButton("Edit", <FaEdit />, () => {
              setEditable(true);
            })}
      </div>
      <div className="deckOverview flexRow">
        <div className="flexRow">
          <div>
            {activeDeck?.colours ? (
              <DeckMana colours={activeDeck.colours} />
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
                <li
                  key={type}
                  className={`${
                    quantityNeeded !== quantityOwned && quantityNeeded != 0
                      ? "bold"
                      : undefined
                  }`}
                >
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
            <p className="subtext">
              ${getDeckCost(activeDeck ? activeDeck.cards : cards)}
            </p>
          </div>
          {statusIcon(cards, activeDeck)}
        </div>
      </div>
      {editable && <CardSearchBar onDeckCardAdd={onDeckCardAdd} />}

      <CardListView
        deckCards={cards}
        editable={editable}
        setCards={setCards}
        isDeckView={true}
      />
    </>
  );
};
