import type { Deck } from "../../../types/MagicTheGathering";
import { manaIcon } from "./ManaRow";
import manaDefault from "../../../assets/manaDefault.svg";
import { IconItem } from "../../shared/IconItem";
import { GiCash } from "react-icons/gi";
import { getDeckCost } from "../../../utils/decks";
import { TbCardsFilled } from "react-icons/tb";
import { RiCheckboxCircleFill, RiErrorWarningFill } from "react-icons/ri";
import "../../styles.css";
import "../Deck.css";

const manaMap = {
  B: "Black",
  U: "Blue",
  G: "Green",
  R: "Red",
  W: "White",
};

interface DeckManaBreakdownProps {
  colours?: string[];
  deck: Deck;
  deckSize?: number;
  isDeckReady?: boolean;
  requiredDeckSize?: number;
  totalMissingCards?: number;
}

export function DeckManaBreakdown({
  colours,
  deck,
  deckSize = 0,
  isDeckReady = false,
  requiredDeckSize = 0,
  totalMissingCards = 0,
}: DeckManaBreakdownProps): React.JSX.Element {
  return (
    <div className="deckManaOverview">
      <div className="manaColours">
        {/* <h3>Deck Colours</h3> */}
        <div className="manaColourList">
          {colours?.map((colour, index) => {
            const src = manaIcon[colour] || manaDefault;
            const percentage = deckSize
              ? ((getColourDeckCount(colour, deck) / deckSize) * 100).toFixed(0)
              : "0";

            return (
              <div className="manaColourItem" key={index}>
                <img
                  key={index}
                  src={src}
                  alt={`${colour} mana symbol`}
                  className="manaIcon"
                />
                <span className="bold">
                  {manaMap[colour as keyof typeof manaMap]}
                </span>
                <p>{percentage}%</p>
              </div>
            );
          })}
        </div>
      </div>
      <div className="manaGraph">
        <h3>Mana Curve</h3>
      </div>
      <div>
        {/* <h3>Summary</h3> */}
        <div className="deckMetricsBreakdown flexRow">
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
            icon={<TbCardsFilled />}
            text={
              <>
                <p>Total Cards</p>
                <p className="subtext">
                  {deckSize}/{requiredDeckSize}
                </p>
              </>
            }
          />
          <IconItem
            icon={
              isDeckReady ? <RiCheckboxCircleFill /> : <RiErrorWarningFill />
            }
            text={
              <>
                <p>{isDeckReady ? "Deck is ready" : "Status"}</p>
                <p className="subtext">
                  {isDeckReady ? " " : `${totalMissingCards} Missing`}{" "}
                </p>
              </>
            }
          />
        </div>
      </div>
    </div>
  );
}

function getColourDeckCount(colour: string, deck: Deck): number {
  return (
    deck.cards?.reduce((sum, card) => {
      if (card.manaTypes?.includes(colour)) {
        return sum + (card.quantityNeeded ?? 0);
      }
      return sum;
    }, 0) ?? 0
  );
}
