import type { Deck } from "../../types/MagicTheGathering";
import "../styles.css";
import { ManaRow } from "./components/ManaRow";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { PiWarningCircleBold } from "react-icons/pi";

interface Props {
  deck: Deck;
}

export function DeckView({ deck }: Props) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/deck/${deck.id}/`);
  };

  const isDeckReady = useMemo(() => {
    return deck.cards.every((card) => {
      const owned = Number(card.quantityOwned) ?? 0;
      const needed = Number(card.quantityNeeded) ?? 0;
      return owned >= needed;
    });
  }, [deck.cards]);

  return (
    <div
      className={"deck cursor-pointer"}
      onClick={handleClick}
      style={{
        backgroundImage: deck?.featureCard?.imageUrl
          ? `linear-gradient(
        to bottom, 
        rgba(0, 0, 0, 0.5) 0%, 
        rgba(0, 0, 0, 0.45) 50%, 
        rgba(0, 0, 0, 0.75) 100%
      ), url(${deck.featureCard.imageUrl})`
          : "",
        backgroundPosition: "center -100px",
      }}
    >
      <div className="deckTop">
        <p className="emphasis">{deck.name}</p>
      </div>
      {deck.colours && deck.colours.length > 0 && (
        <ManaRow colours={deck.colours} />
      )}

      <div className="formatTag">
        {!isDeckReady && <PiWarningCircleBold />}

        <p>{deck.format}</p>
      </div>
    </div>
  );
}
