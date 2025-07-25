import { useEffect, useState } from "react";
import { getCardsFromStorage } from "../../utils/storage";
import { CardPreview } from "./CardPreview";
import type { CollectionCard } from "../../types/MagicTheGathering";

export function CardDashboard() {
  const [cards, setCards] = useState<CollectionCard[]>([]);
  useEffect(() => {
    getCardsFromStorage()
      .then((data) => {
        setCards(data);
      })
      .catch(() => {
        setCards([]);
      });
  }, []);

  return (
    <div className="contentContainer" style={{ maxWidth: "1600px" }}>
      <CardPreview collectionCards={cards} viewPreference="Grid" />
    </div>
  );
}
