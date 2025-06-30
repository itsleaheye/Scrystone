import React, { useEffect, useMemo, useState } from "react";
import { useDeckParser } from "../../hooks/useDeckParser";
import type { Deck } from "../../types/MagicTheGathering";
import { CardSearchBar } from "../CardSearchBar";
import { GiCash } from "react-icons/gi";
import { RiCheckboxCircleFill, RiErrorWarningFill } from "react-icons/ri";
import { useCardParser } from "../../hooks/useCardParser";
import { primaryButton, tertiaryButton } from "../PrimaryActions";
import { FaArrowLeft, FaEdit, FaSave } from "react-icons/fa";
import { CardListView } from "../Cards/CardListView";
import { IconItem } from "../shared/IconItem";
import { useDeckFormState } from "../../hooks/useDeckFormState";
import "../styles.css";
import "./Deck.css";
import { DeckField } from "./DeckField";
import { ManaRow } from "./ManaRow";
import { getDeckCost } from "../utils/decks";
import { getDecksFromStorage } from "../utils/storage";

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

  const [editable, setEditable] = useState<boolean>(deckId === undefined);

  useEffect(() => {
    if (deckId !== undefined) {
      const foundDeck = getDecksFromStorage(deckId)[0];
      setActiveDeck(foundDeck);

      if (foundDeck) {
        setCards(foundDeck.cards);
      }
    }
  }, [deckId]);

  const { name, setName, description, setDescription, format, setFormat } =
    useDeckFormState(activeDeck);

  // For sake of performance, memoize the deck sizes
  const requiredDeckSize = useMemo(
    () => (format === "Commander" ? 100 : 60),
    [format]
  );
  const currentDeckSize = useMemo(
    () => cards.reduce((sum, card) => sum + (card.quantityNeeded || 0), 0),
    [cards]
  );
  const isDeckReady = currentDeckSize >= requiredDeckSize;

  // For sake of performance, memoize the summary
  const summary = useMemo(
    () =>
      getDeckTypeSummaryWithDefaults(
        editable ? cards : activeDeck?.cards || []
      ),
    [cards, editable, activeDeck]
  );

  const handleSave = () => {
    const savedDeck = onDeckSave(
      cards,
      name,
      format,
      activeDeck?.id,
      description
    );
    setActiveDeck(savedDeck);
    setEditable(false);
  };

  return (
    <>
      {/* Primary actions row */}
      <div className="actionRow flexRow">
        {tertiaryButton(
          editable ? "Cancel and go back" : "Go back",
          <FaArrowLeft />,
          () => setCurrentView("deckCollection")
        )}
        {editable
          ? primaryButton("Save", <FaSave />, handleSave)
          : primaryButton("Edit", <FaEdit />, () => setEditable(true))}
      </div>

      {/* Deck overview */}
      <div className="deckOverview flexRow">
        <div className="flexRow">
          <div className="deckCol1">
            {
              activeDeck?.colours && <ManaRow colours={activeDeck.colours} /> // To do: Fix this so it updates on card add and not just save
            }

            <div className="flexRow">
              <DeckField
                customRender={<p className="bold deckName">{name}</p>}
                editable={editable}
                onChange={setName}
                placeholder="Deck name..."
                value={name}
              />
              <DeckField
                customRender={
                  <div className="playStyleTag">
                    <p>{format}</p>
                  </div>
                }
                editable={editable}
                onChange={(value) =>
                  setFormat(value === "Commander" ? "Commander" : "Standard")
                }
                placeholder=""
                type="select"
                value={format}
              />
            </div>
            <DeckField
              editable={editable}
              onChange={setDescription}
              placeholder="Deck description..."
              type="textarea"
              value={description}
            />
          </div>

          {/* Overview col 2  */}
          <div className="deckCardSummary">
            <ul>
              {summary.map(({ type, quantityNeeded, quantityOwned }) => (
                <li
                  key={type}
                  className={
                    quantityNeeded !== quantityOwned && quantityNeeded !== 0
                      ? "bold"
                      : undefined
                  }
                >
                  {type}s {quantityOwned}/{quantityNeeded}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Overview col 3 */}
        <div className="deckBreakdown flexRow">
          <IconItem
            icon={<GiCash />}
            text={
              <>
                <p>Deck Cost</p>
                <p className="subtext">${getDeckCost(cards).toFixed(2)}</p>
              </>
            }
          />
          <IconItem
            icon={
              isDeckReady ? <RiCheckboxCircleFill /> : <RiErrorWarningFill />
            }
            text={
              <>
                <p>{isDeckReady ? "Deck is ready" : "Deck not ready"}</p>
                <p className="subtext">
                  {currentDeckSize}/{requiredDeckSize} Cards
                </p>
              </>
            }
          />
        </div>
      </div>

      {/* Only show search bar in an edit state */}
      {editable && (
        <CardSearchBar onDeckCardAdd={onDeckCardAdd} deckCards={cards} />
      )}

      {/* Card gallery view */}
      <CardListView
        deckCards={cards}
        editable={editable}
        isDeckView={true}
        setCards={setCards}
      />
    </>
  );
};
