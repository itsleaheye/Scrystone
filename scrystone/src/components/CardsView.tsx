import type { Card } from "../types/MagicTheGathering";

export function CardsView({ cards }: { cards?: Card[] }): React.JSX.Element {
  if (!cards || cards.length === 0) {
    return <></>;
  }

  return (
    <div className="grid">
      {cards.map((card, index) => (
        <div key={index} className="card">
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
      ))}
    </div>
  );
}
