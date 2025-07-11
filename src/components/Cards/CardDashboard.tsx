import { getCardsFromStorage } from "../../utils/storage";
import { Welcome } from "../Welcome/Welcome";
import { CardPreview } from "./CardPreview";

interface CardDashboardProps {
  hasCollection: boolean;
}

export function CardDashboard({ hasCollection }: CardDashboardProps) {
  const cards = getCardsFromStorage();
  if (!hasCollection) return <Welcome />;

  return <CardPreview collectionCards={cards} viewPreference="Grid" />;
}
