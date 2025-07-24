import { getCardsFromStorage } from "../../utils/storage";
import { CardPreview } from "./CardPreview";

export function CardDashboard() {
  const cards = getCardsFromStorage();

  return (
    <div className="contentContainer" style={{ maxWidth: "1600px" }}>
      <CardPreview collectionCards={cards} viewPreference="Grid" />
    </div>
  );
}
