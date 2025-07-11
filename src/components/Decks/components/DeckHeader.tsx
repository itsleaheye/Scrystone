import type {
  CardTypeSummary,
  Deck,
  DeckCard,
  DeckFormat,
} from "../../../types/MagicTheGathering";
import { ManaRow } from "./ManaRow";
import { DeckField } from "./DeckField";
import { TypeSummary } from "../../shared/TypeSummary";
import { IconItem } from "../../shared/IconItem";
import { GiCash } from "react-icons/gi";
import { getDeckCost } from "../../../utils/decks";
import { useMemo } from "react";
import { RiCheckboxCircleFill, RiErrorWarningFill } from "react-icons/ri";
import { getColoursFromCards } from "../../../utils/cards";

interface DeckPreviewProps {
  deck?: Deck;
  cards?: DeckCard[];
  summary: CardTypeSummary[];
  formDetails?: {
    name: string;
    setName: (name: string) => void;
    description: string;
    setDescription: (value: string) => void;
    format: DeckFormat;
    setFormat: (format: DeckFormat) => void;
    isValidFormat: (value: any) => value is DeckFormat;
  };
}

export function DeckHeader({
  cards,
  deck,
  summary,
  formDetails,
}: DeckPreviewProps): React.JSX.Element {
  const editable = formDetails !== undefined;

  const requiredDeckSize = useMemo(() => {
    const currentFormat = editable ? formDetails.format : deck?.format;
    switch (currentFormat) {
      case "Commander":
        return 100;
      case "Standard":
        return 60;
      case "Draft":
        return 40;
      default:
        return 60;
    }
  }, [editable, formDetails?.format, deck?.format]);

  const currentDeckSize = useMemo(
    () =>
      cards !== undefined
        ? cards.reduce((sum, card) => sum + (card.quantityNeeded || 0), 0)
        : deck?.cards.reduce(
            (sum, card) => sum + (card.quantityNeeded || 0),
            0
          ),
    [cards]
  );
  const isDeckReady = currentDeckSize == requiredDeckSize;

  const deckColours =
    cards && cards.length > 0 ? getColoursFromCards(cards) : deck?.colours;

  return (
    <div className="deckOverview">
      <div className="flexSwap">
        {/* Overview col 1 */}
        <div className={`deckCol1 ${!editable ? "staticDeckCol1" : ""}`}>
          <ManaRow colours={deckColours} />

          <div className="deckFields">
            {editable ? (
              <>
                <DeckField
                  onChange={formDetails.setName}
                  placeholder="Deck name..."
                  value={formDetails.name}
                />
                <DeckField
                  onChange={(value) => {
                    const validFormat: DeckFormat = formDetails.isValidFormat(
                      value
                    )
                      ? value
                      : "Commander";
                    formDetails.setFormat(validFormat);
                  }}
                  placeholder=""
                  type="select"
                  value={formDetails.format}
                />
              </>
            ) : (
              <>
                <p className="bold deckName overflowElipse">{deck?.name}</p>
                <div className="formatTag">
                  <p>{deck?.format}</p>
                </div>
              </>
            )}
          </div>
          {editable ? (
            <DeckField
              onChange={formDetails.setDescription}
              placeholder="Deck description..."
              type="textarea"
              value={formDetails.description || ""}
            />
          ) : (
            <p>{deck?.description}</p>
          )}
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
              <p className="subtext">
                ${deck ? getDeckCost(deck.cards).toFixed(2) : 0.0}
              </p>
            </>
          }
        />
        <IconItem
          icon={isDeckReady ? <RiCheckboxCircleFill /> : <RiErrorWarningFill />}
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
  );
}
