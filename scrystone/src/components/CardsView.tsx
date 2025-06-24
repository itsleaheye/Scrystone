import type {
  Card,
  CollectionCard,
  DeckCard,
} from "../types/MagicTheGathering";
import cardBackDefault from "../assets/cardBackDefault.jpg";
import { useEffect, useState } from "react";
import { getCardsFromStorage } from "../hooks/useCardParser";
import { FaMinus, FaPlus } from "react-icons/fa6";

interface Props {
  cards: Card[] | CollectionCard[] | DeckCard[];
  showSearchAndFilters?: boolean;
  editable?: boolean;
  isDeckView?: boolean;
}

export function CardsView({
  cards,
  editable = false,
  isDeckView = false,
  showSearchAndFilters = false,
}: Props): React.JSX.Element {
  if (!cards || cards.length === 0) return <></>;

  const [ownedQuantities, setOwnedQuantities] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    if (isDeckView) {
      const cardCollection = getCardsFromStorage();
      const map: Record<string, number> = {};
      for (const card of cardCollection) {
        const key = card.name.trim().toLowerCase();
        map[key] = (map[key] || 0) + (card.quantityOwned || 0);
      }
      setOwnedQuantities(map);
    }
  }, [isDeckView]);

  const [mergedCards, setMergedCards] = useState<
    (Card & { quantity: number })[]
  >([]);

  useEffect(() => {
    const map = new Map<string, Card & { quantity: number }>();
    for (const card of cards) {
      const key = card.name.trim().toLowerCase();
      const quantity =
        "quantityOwned" in card ? Math.max(card.quantityOwned ?? 0, 1) : 1;

      if (map.has(key)) {
        map.get(key)!.quantity += quantity;
      } else {
        map.set(key, { ...card, quantity });
      }
    }
    setMergedCards(Array.from(map.values()));
  }, [cards]);

  const onChangeQuantity = (cardName: string, amount: number) => {
    setMergedCards((prev) =>
      prev
        .map((card) =>
          card.name.trim().toLowerCase() === cardName.trim().toLowerCase()
            ? { ...card, quantity: card.quantity + amount }
            : card
        )
        .filter((card) => card.quantity > 0)
    );
  };

  return (
    <>
      {showSearchAndFilters && (
        <div className="flexRow centred">
          <p>Filters and sorting tbd...</p>
        </div>
      )}
      <div className="grid">
        {mergedCards.map((card, index) => {
          const quantityOwned =
            ownedQuantities[card.name.trim().toLowerCase()] || 0;

          return (
            <div
              key={index}
              className={`${editable ? "editableCard card" : "card"}`}
            >
              {card.imageUrl ? (
                <img
                  src={card.imageUrl}
                  alt={card.name}
                  className={`cardArt ${
                    isDeckView && quantityOwned < card.quantity
                      ? "opacity-50"
                      : ""
                  }`}
                />
              ) : (
                // To do: Find placeholder card or generate placeholder based on details.
                <div className="cardPlaceholder">
                  <img
                    src={cardBackDefault}
                    alt={card.name}
                    className="cardArt"
                  />
                  <span>
                    <p className="emphasis">{card.name}</p>
                    <p>{card.type}</p>
                    <p>
                      {card.manaCost}
                      {card.manaType}
                    </p>
                  </span>
                </div>
              )}
              <CardQuantityFooter
                card={card}
                editable={editable}
                isDeckView={isDeckView}
                onChangeQuantity={onChangeQuantity}
                quantityOwned={quantityOwned}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}

interface CardQuantityFooterProps {
  card: { name: string; quantity: number };
  editable: boolean;
  isDeckView: boolean;
  onChangeQuantity: (name: string, delta: number) => void;
  quantityOwned: number;
}

function CardQuantityFooter({
  card,
  editable,
  isDeckView,
  onChangeQuantity,
  quantityOwned,
}: CardQuantityFooterProps) {
  const quantityLabel = isDeckView
    ? `${quantityOwned}/${card.quantity}`
    : `x${card.quantity}`;

  const quantityChip = (
    <div className="quantity rounded-tr-[100%] rounded-bl-[10%]">
      <p>{quantityLabel}</p>
    </div>
  );

  const chipButton = (icon: React.ReactNode, delta: number) => (
    <div
      className={`cardChip ${
        delta === -1
          ? "cardChipLeft rounded-tr-[100%] rounded-bl-[20%]"
          : "rounded-tl-[100%] rounded-br-[20%]"
      }`}
    >
      <p>
        <div onClick={() => onChangeQuantity(card.name, delta)}>{icon}</div>
      </p>
    </div>
  );

  if (isDeckView && editable) {
    return (
      <div className="cardFooterGroup">
        <div className="cardFooter">
          {chipButton(<FaMinus />, -1)}
          {chipButton(<FaPlus />, 1)}
        </div>
        <div className="cardQuantity">{quantityChip}</div>
      </div>
    );
  }

  if (isDeckView || card.quantity > 1) {
    return quantityChip;
  }

  return null;
}
