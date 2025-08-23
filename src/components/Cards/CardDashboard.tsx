import { useEffect, useState } from "react";
import { getCardsFromStorage } from "../../utils/storage";
import { CardPreview } from "./CardPreview";
import type { CollectionCard } from "../../types/MagicTheGathering";
import { useLocation } from "react-router-dom";

export function CardDashboard() {
  const location = useLocation();
  const [cards, setCards] = useState<CollectionCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadCards = async () => {
      setLoading(true);

      const data = await getCardsFromStorage();

      setCards(data);
      setLoading(false);
    };

    loadCards();
  }, [location.search]);

  return (
    <div className="contentContainer">
      <CardPreview
        collectionCards={cards}
        viewPreference="Grid"
        loading={loading}
      />
    </div>
  );
}
