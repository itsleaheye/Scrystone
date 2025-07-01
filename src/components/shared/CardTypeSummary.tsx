import type { CardTypeSummary } from "../../types/MagicTheGathering";
import "./CardTypeSummary.css";

interface CardTypeSummaryProps {
  summary: CardTypeSummary[];
  hasBorder?: boolean;
}

export function CardTypeSummary({
  summary,
  hasBorder = false,
}: CardTypeSummaryProps) {
  return (
    <div className={`deckCardSummary ${hasBorder ? "hasBorder" : undefined}`}>
      <ul>
        {summary.map(({ type, quantityNeeded, quantityOwned }) => (
          <li
            key={type}
            className={
              quantityNeeded !== quantityOwned && quantityNeeded !== 0
                ? "bold"
                : undefined
            }
          >
            {type}s {quantityOwned}/{quantityNeeded}
          </li>
        ))}
      </ul>
    </div>
  );
}
