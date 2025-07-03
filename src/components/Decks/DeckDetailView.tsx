import React, { useEffect, useMemo, useState } from "react";
import { useDeckParser } from "../../hooks/useDeckParser";
import type { Deck } from "../../types/MagicTheGathering";
import { CardSearchBar } from "../CardSearchBar";
import { GiCash } from "react-icons/gi";
import { RiCheckboxCircleFill, RiErrorWarningFill } from "react-icons/ri";
import { useCardParser } from "../../hooks/useCardParser";
import { ActionButton } from "../PrimaryActions";
import { FaArrowLeft, FaEdit, FaSave, FaTrash } from "react-icons/fa";
import { IconItem } from "../shared/IconItem";
import { useDeckFormState } from "../../hooks/useDeckFormState";
import "../styles.css";
import "./Deck.css";
import { DeckField } from "./DeckField";
import { ManaRow } from "./ManaRow";
import { getDeckCost, getDeckTypeSummaryWithDefaults } from "../utils/decks";
import { getDecksFromStorage } from "../utils/storage";
import { CardTypeSummary } from "../shared/CardTypeSummary";
import { CardPreview } from "../Cards/CardPreview";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { PiExportBold } from "react-icons/pi";

export const DeckDetailView = ({
  deckId,
  setCurrentView,
}: {
  deckId?: number;
  setCurrentView: (view: string) => void;
}): React.JSX.Element => {
  const { cards, onDeckCardAdd, setCards } = useCardParser();
  const { onDeckSave, onDeckDelete, onDeckExport } = useDeckParser();
  const isMobile = useMediaQuery("(max-width: 650px)");

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
  const isDeckReady = currentDeckSize == requiredDeckSize;

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
        <div>
          <ActionButton
            icon={<FaArrowLeft />}
            label={editable ? "Cancel" : "Go back"}
            onClick={() => setCurrentView("deckCollection")}
            variation="tertiary"
          />
        </div>
        <div className="flexRow">
          {activeDeck && (
            <ActionButton
              hideLabel={isMobile}
              icon={<FaTrash />}
              label={"Delete"}
              onClick={() => {
                // To do add confirmation
                onDeckDelete(activeDeck.id);
                setCurrentView("deckCollection");
              }}
              variation="destroy"
            />
          )}
          {activeDeck && !editable && (
            <ActionButton
              icon={<PiExportBold />}
              label={"Export Deck"}
              onClick={() => {
                onDeckExport(activeDeck.cards, activeDeck.name);
                setCurrentView("deckCollection");
              }}
              variation="secondary"
            />
          )}
          {editable ? (
            <ActionButton
              icon={<FaSave />}
              label={"Save"}
              onClick={handleSave}
              variation="primary"
            />
          ) : (
            <ActionButton
              icon={<FaEdit />}
              label={"Edit"}
              onClick={() => setEditable(true)}
              variation="primary"
            />
          )}
        </div>
      </div>

      {/* Deck overview */}
      <div className="deckOverview">
        <div className="flexSwap">
          <div className={`deckCol1 ${!editable ? "staticDeckCol1" : ""}`}>
            {
              activeDeck?.colours && <ManaRow colours={activeDeck.colours} /> // To do: Fix this so it updates on card add and not just save
            }

            <div className="deckFields">
              <DeckField
                customRender={
                  <p className="bold deckName overflowElipse">{name}</p>
                }
                editable={editable}
                onChange={setName}
                placeholder="Deck name..."
                value={name}
              />
              <DeckField
                customRender={
                  <div className="formatTag">
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
          <CardTypeSummary summary={summary} hasBorder={true} />
        </div>

        {/* Overview col 3 */}
        <div className="deckBreakdown flexSwapInverse">
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

      {/* Card view (list or gallery view)*/}
      <CardPreview
        deckCards={cards}
        editable={editable}
        isDeckView={true}
        setCards={setCards}
      />
    </>
  );
};
