import type { Card } from "../types/MagicTheGathering";
import "./styles.css";

export function Card({ card }: { card: Card }) {
  return (
    // To do: On hover, flip card to show quantity, details, favourite, deck, etc
    <div className="card">
      {card.imageUrl ? (
        <img src={card.imageUrl} alt={card.name} className="cardArt" />
      ) : (
        // To do: Find placeholder card or generate placeholder based on details.
        <div className="cardPlaceholder">
          <p className="emphasis">{card.name}</p>
          <p>{card.type}</p>
          <p>
            {card.manaCost}
            {card.manaType}
          </p>
        </div>
      )}
    </div>
  );
}
