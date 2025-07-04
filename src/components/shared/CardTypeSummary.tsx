import type { CardTypeSummary } from "../../types/MagicTheGathering";
import { getTypeIcon } from "./TypeIcon";
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
    <div className={`deckCardSummary ${hasBorder ? "hasBorder" : "noBorder"}`}>
      <ul className={hasBorder ? "" : "centredList"}>
        {summary.map(({ type, quantityNeeded, quantityOwned }) => {
          let typeLabel = type;
          if (type === "Sorcery") {
            typeLabel = "Sorcerie";
          } else if (type === "Instant") {
            typeLabel = "Sorcerie";
          }

          return (
            <li
              key={type}
              className={
                quantityNeeded !== quantityOwned &&
                quantityNeeded !== 0 &&
                hasBorder
                  ? "bold"
                  : undefined
              }
            >
              {getTypeIcon(type)}
              {typeLabel}s {quantityOwned}/{quantityNeeded}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
