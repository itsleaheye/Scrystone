import { getCardsFromStorage } from "../../utils/storage";
import { Welcome } from "../Welcome/Welcome";
import { CardPreview } from "./CardPreview";

export function CardDashboard() {
  const cards = getCardsFromStorage();
  if (!cards || cards.length == 0) return <Welcome />;

  return (
    <div className="p-[var(--pad-sm)] mx-auto" style={{ maxWidth: "1600px" }}>
      <CardPreview collectionCards={cards} viewPreference="Grid" />
    </div>
  );
}
