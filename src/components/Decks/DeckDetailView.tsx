import React, { useEffect, useMemo, useState } from "react";
import { useDeckParser } from "../../hooks/useDeckParser";
import type {
  CardTypeSummary,
  Deck,
  DeckFormat,
} from "../../types/MagicTheGathering";
import { GiCash } from "react-icons/gi";
import { RiCheckboxCircleFill, RiErrorWarningFill } from "react-icons/ri";
import { useCardParser } from "../../hooks/useCardParser";
import { ActionButton } from "../shared/PrimaryActions";
import { FaArrowLeft, FaEdit, FaSave, FaTrash } from "react-icons/fa";
import { IconItem } from "../shared/IconItem";
import { useDeckFormState } from "../../hooks/useDeckFormState";
import "../styles.css";
import "./Deck.css";
import { DeckField } from "./DeckField";
import { ManaRow } from "./ManaRow";
import { getDeckCost, getDeckTypeSummaryWithDefaults } from "../../utils/decks";
import { getDecksFromStorage } from "../../utils/storage";
import { CardPreview } from "../Cards/CardPreview";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { PiExportBold } from "react-icons/pi";
import { ViewStyleFilter } from "../shared/ViewStyleFilter";
import { CardSearchBar } from "../shared/CardSearchBar";
import { TypeSummary } from "../shared/TypeSummary";

export const DeckDetailView = ({
  deckId,
  setCurrentView,
}: {
  deckId?: number;
  setCurrentView: (view: string) => void;
}): React.JSX.Element => {
  const { cards, onDeckCardAdd, setCards } = useCardParser();
  const { isValidFormat, onDeckSave, onDeckDelete, onDeckExport } =
    useDeckParser();
  const isMobile = useMediaQuery("(max-width: 650px)");

  const [activeDeck, setActiveDeck] = useState<Deck | undefined>();
  const [editable, setEditable] = useState<boolean>(deckId === undefined);
  const [viewStyle, setViewStyle] = useState<string>("List");

  useEffect(() => {
    if (deckId === undefined) return;

    async function loadDeck() {
      try {
        const decks = await getDecksFromStorage(deckId);
        const foundDeck = decks[0];
        setActiveDeck(foundDeck);

        if (foundDeck) {
          setCards(foundDeck.cards);
        }
      } catch (error) {
        console.error("Failed to load deck:", error);
        setActiveDeck(undefined);
      }
    }

    loadDeck();
  }, [deckId, setCards]);

  const { name, setName, description, setDescription, format, setFormat } =
    useDeckFormState(activeDeck);

  // For sake of performance, memoize the deck sizes
  const requiredDeckSize = useMemo(() => {
    switch (format) {
      case "Commander":
        return 100;
      case "Standard":
        return 60;
      case "Draft":
        return 40;
      default:
        return 60;
    }
  }, [format]);
  const currentDeckSize = useMemo(
    () => cards.reduce((sum, card) => sum + (card.quantityNeeded || 0), 0),
    [cards]
  );
  const isDeckReady = currentDeckSize == requiredDeckSize;

  const [summary, setSummary] = useState<CardTypeSummary[]>([]);

  useEffect(() => {
    async function loadSummary() {
      let summaryResult = await getDeckTypeSummaryWithDefaults(
        editable ? cards : activeDeck?.cards || []
      );
      setSummary(summaryResult);
    }
    loadSummary();
  }, [cards, editable, activeDeck]);

  const handleSave = async () => {
    const savedDeck = await onDeckSave(
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
            label={editable ? "Cancel" : isMobile ? "Back" : "Go back"}
            onClick={() => {
              if (
                editable &&
                activeDeck &&
                window.confirm("Discard any changes and go back?")
              ) {
                setEditable(false);
                setCurrentView(`deckCreateEditView=${activeDeck.id}`);
              } else {
                setEditable(false);
                setCurrentView("deckCollection");
              }
            }}
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
                if (
                  window.confirm("Are you sure you want to delete this deck?")
                ) {
                  onDeckDelete(activeDeck.id);
                  setCurrentView("deckCollection");
                }
              }}
              variation="destroy"
            />
          )}
          {activeDeck && !editable && (
            <ActionButton
              hideLabel={isMobile}
              icon={<PiExportBold />}
              label={"Export"}
              onClick={() => {
                onDeckExport(
                  activeDeck.cards,
                  activeDeck.name,
                  activeDeck.format
                );
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
              activeDeck?.colours && activeDeck.colours.length > 0 && (
                <ManaRow colours={activeDeck.colours} />
              ) // To do: Fix this so it updates on card add and not just save
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
                onChange={(value) => {
                  const validFormat: DeckFormat = isValidFormat(value)
                    ? value
                    : "Commander";
                  setFormat(validFormat);
                }}
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
          <TypeSummary summary={summary} hasBorder={true} />
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
        <div className="deckCardActions">
          <ViewStyleFilter
            isMobile={isMobile}
            viewStyle={viewStyle}
            setViewStyle={setViewStyle}
          />
          <CardSearchBar onDeckCardAdd={onDeckCardAdd} deckCards={cards} />
        </div>
      )}

      <CardPreview
        deckCards={cards}
        editable={editable}
        isDeckView={true}
        setCards={setCards}
        viewPreference={viewStyle}
        activeCardPreview={!isMobile ? cards[cards.length - 1] : undefined}
      />
    </>
  );
};
