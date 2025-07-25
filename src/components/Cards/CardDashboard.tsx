import { useEffect, useState } from "react";
import { getCardsFromStorage } from "../../utils/storage";
import { CardPreview } from "./CardPreview";
import type { CollectionCard } from "../../types/MagicTheGathering";

export function CardDashboard() {
  const [cards, setCards] = useState<CollectionCard[]>([]);

  const loadCards = async () => {
    const data = await getCardsFromStorage();
    setCards(data);
  };

  useEffect(() => {
    loadCards();
  }, []);

  return (
    <div className="contentContainer" style={{ maxWidth: "1600px" }}>
      <CardPreview collectionCards={cards} viewPreference="Grid" />
    </div>
  );
}
