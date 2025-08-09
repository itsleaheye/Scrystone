import { FaArrowRight } from "react-icons/fa";
import type { DeckCard } from "../../../types/MagicTheGathering";

interface ChangeCoverModalProps {
  featureCard: DeckCard | null;
  setIsModalOpen: (isOpen: boolean) => void;
  setFeatureCard: (card: DeckCard | null) => void;
  cards?: DeckCard[];
}

export function FeatureModal({
  featureCard,
  setIsModalOpen,
  setFeatureCard,
  cards,
}: ChangeCoverModalProps) {
  const uniqueCardNames = Array.from(
    new Set(cards?.map((card) => card.name))
  ).sort();

  const handleSubmit = () => {
    if (!featureCard) return;

    const selectedCard = cards?.find((card) => card.name === featureCard.name);
    if (!selectedCard) return;

    setFeatureCard(featureCard);
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className={"flexRow manaAndCoverRow"}>
        <h2 style={{ color: "var(--black)" }}>Select Cover Card</h2>
        <button
          disabled={!featureCard}
          className={"actionButton"}
          onClick={() => {
            handleSubmit();
          }}
          style={{
            justifyContent: "end",
            marginBottom: "var(--pad-xs)",
          }}
        >
          Done
          <FaArrowRight />
        </button>
      </div>

      <select
        value={featureCard?.name ?? ""}
        onChange={(e) => {
          const selectedName = e.target.value;
          const selectedCard =
            cards?.find((card) => card.name === selectedName) || null;
          setFeatureCard(selectedCard);
        }}
      >
        <option value="" disabled>
          -- Choose a card to feature --
        </option>
        {uniqueCardNames.map((cardName) => (
          <option key={cardName} value={cardName}>
            {cardName}
          </option>
        ))}
      </select>
    </div>
  );
}
