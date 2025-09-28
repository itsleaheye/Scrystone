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
import { drawHand, getDeckCost, type DrawnCard } from "../../../utils/decks";
import { useEffect, useMemo, useState } from "react";
import { RiCheckboxCircleFill, RiErrorWarningFill } from "react-icons/ri";
import { getColoursFromCards } from "../../../utils/cards";
import "../../styles.css";
import { TbCardsFilled } from "react-icons/tb";
import { useMediaQuery } from "../../../hooks/useMediaQuery";
import { FaEdit } from "react-icons/fa";
import { FeatureModal } from "./FeatureModal";
import { IoMdClose } from "react-icons/io";
import { ActionButton } from "../../shared/PrimaryActions";
import { Tooltip } from "../../shared/Tooltip";

interface DeckPreviewProps {
  deck?: Deck;
  cards?: DeckCard[];
  formDetails?: {
    name: string;
    setName: (name: string) => void;
    description: string;
    setDescription: (value: string) => void;
    format: DeckFormat;
    setFormat: (format: DeckFormat) => void;
    isValidFormat: (value: any) => value is DeckFormat;
    featureCard: DeckCard | null;
    setFeatureCard: (card: DeckCard | null) => void;
  };
  previewHand?: DrawnCard[];
  setPreviewHand?: (drawnCards: DrawnCard[]) => void;
  summary: CardTypeSummary[];
}

export function DeckHeader({
  cards,
  deck,
  formDetails,
  previewHand,
  setPreviewHand,
  summary,
}: DeckPreviewProps): React.JSX.Element {
  const editable = formDetails !== undefined;
  const isMobile = useMediaQuery("(max-width: 900px)");
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const isDeckReady = useMemo(() => {
    const cardList = cards ?? deck?.cards ?? [];
    const ownsAllCards = cardList.every(
      (card) => (card.quantityOwned ?? 0) >= (card.quantityNeeded ?? 0)
    );
    const correctSize = currentDeckSize === requiredDeckSize;

    return ownsAllCards && correctSize;
  }, [cards, deck?.cards]);

  const totalMissingCards = useMemo(() => {
    return summary.reduce(
      (sum, { quantityNeeded, quantityOwned }) =>
        sum + Math.max(0, quantityNeeded - quantityOwned),
      0
    );
  }, [summary]);

  const deckColours =
    cards && cards.length > 0 ? getColoursFromCards(cards) : deck?.colours;

  const [featureEditable, setFeatureEditable] = useState<boolean>(
    (editable &&
      ((deck?.cards && deck.cards.length > 0) ||
        (cards && cards.length > 0))) ??
      false
  );
  useEffect(() => {
    const hasCards =
      (deck?.cards && deck.cards.length > 0) || (cards && cards.length > 0);
    if (editable && hasCards) {
      setFeatureEditable(true);
    } else {
      setFeatureEditable(false);
    }
  }, [deck?.cards, editable, cards]);

  const activeFeatureCard = formDetails?.featureCard ?? deck?.featureCard;
  const activeHand = previewHand && previewHand.length > 0;
  const missingCards = deck?.cards
    ? deck?.cards.filter(
        (card) => (card.quantityOwned ?? 0) < (card.quantityNeeded ?? 0)
      )
    : [];

  return (
    <>
      <div
        className="deckOverview"
        style={{
          backgroundImage:
            !isMobile && activeFeatureCard?.imageUrl
              ? `linear-gradient(
          to right,
          rgba(245, 245, 245, 0.6) 0%,
          rgba(245, 245, 245, 0.85) 10%,
          rgba(245, 245, 245, 1) 30%,
          rgba(245, 245, 245, 1) 100%
        ), url(${activeFeatureCard.imageUrl})`
              : "",
          backgroundPosition: "center center,-40px -100px",
          backgroundRepeat: "repeat-y",
        }}
      >
        {isModalOpen && formDetails ? (
          <FeatureModal
            setIsModalOpen={setIsModalOpen}
            setFeatureCard={formDetails.setFeatureCard}
            featureCard={activeFeatureCard ?? null}
            cards={cards ?? deck?.cards}
          />
        ) : (
          <div className="flexSwap">
            {/* Overview col 1 */}
            <div className={`deckCol1 ${!editable ? "staticDeckCol1" : ""}`}>
              <div
                className={"flexRow manaAndCoverRow"}
                style={{
                  justifyContent:
                    editable || !isMobile ? "space-between" : "center",
                }}
              >
                <ManaRow colours={deckColours} />

                {featureEditable && (
                  <button
                    className={"actionButton"}
                    style={{
                      marginBottom: "var(--pad-xs)",
                    }}
                    onClick={() => {
                      setIsModalOpen(true);
                    }}
                  >
                    Change Cover
                    <FaEdit />
                  </button>
                )}
              </div>

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
                        const validFormat: DeckFormat =
                          formDetails.isValidFormat(value)
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
          </div>
        )}

        {/* Overview col 2  */}
        <TypeSummary summary={summary} hasBorder={true} />

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
          {missingCards.length > 0 ? (
            <Tooltip
              content={
                <div className="tooltipMissingCards">
                  <h4>Cards Not Owned:</h4>
                  {missingCards.slice(0, 10).map((card) => (
                    <p className="overflowElipse" key={card.name}>
                      {`(${
                        (card.quantityNeeded ?? 0) - (card.quantityOwned ?? 0)
                      }) ${card.name}`}
                    </p>
                  ))}
                  {missingCards.length > 10 && (
                    <span className="italic subtext">
                      Export your deck to see all...
                    </span>
                  )}
                </div>
              }
              theme="light"
            >
              <IconItem
                icon={
                  isDeckReady ? (
                    <RiCheckboxCircleFill />
                  ) : (
                    <RiErrorWarningFill />
                  )
                }
                text={
                  <>
                    <p>
                      {isDeckReady
                        ? "Deck is ready"
                        : currentDeckSize != requiredDeckSize
                        ? "Deck not ready"
                        : "Status"}
                    </p>
                    <p className="subtext">
                      {isDeckReady
                        ? " "
                        : currentDeckSize != requiredDeckSize
                        ? "Not enough cards for format"
                        : `${totalMissingCards} missing`}
                    </p>
                  </>
                }
              />
            </Tooltip>
          ) : (
            <IconItem
              icon={
                isDeckReady ? <RiCheckboxCircleFill /> : <RiErrorWarningFill />
              }
              text={
                <>
                  <p>
                    {isDeckReady
                      ? "Deck is ready"
                      : currentDeckSize != requiredDeckSize
                      ? "Not ready"
                      : "Status"}
                  </p>
                  <p className="subtext">
                    {isDeckReady
                      ? " "
                      : currentDeckSize != requiredDeckSize
                      ? "for format"
                      : `${totalMissingCards} missing`}
                  </p>
                </>
              }
            />
          )}
          <IconItem
            icon={<TbCardsFilled />}
            text={
              <>
                <p>Total Cards</p>
                <p className="subtext">
                  {currentDeckSize}/{requiredDeckSize}
                </p>
              </>
            }
          />
        </div>
      </div>
      {setPreviewHand && deck && (
        <div className="deckOverviewSecondary">
          <div className="deckHand">
            <div className="flexRow handHeader">
              <h3>Opening Hand</h3>
              <div className="flexRow" style={{ gap: "var(--pad-xxs)" }}>
                {activeHand && (
                  <ActionButton
                    icon={<IoMdClose />}
                    label="Close"
                    variation="tertiary"
                    onClick={() => setPreviewHand([])}
                  />
                )}
                <ActionButton
                  icon={<TbCardsFilled />}
                  label="Draw"
                  variation="secondary"
                  onClick={() => {
                    const drawnCards = drawHand(deck);
                    setPreviewHand(drawnCards);
                  }}
                  disabled={deck.cards.length < 1}
                />
              </div>
            </div>
            {activeHand && (
              <div className="handGrid">
                {previewHand.map((card, index) => (
                  <div key={index}>
                    <img src={card.imageUrl} alt={card.name} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
