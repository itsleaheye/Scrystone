import { getCardsFromStorage } from "../../utils/storage";
import { Welcome } from "../Welcome/Welcome";
import { CardPreview } from "./CardPreview";

export function CardDashboard() {
  const cards = getCardsFromStorage();
  if (!cards || cards.length == 0) return <Welcome />;

  return <CardPreview collectionCards={cards} viewPreference="Grid" />;
}
