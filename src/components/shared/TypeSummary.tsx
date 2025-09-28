import type { CardTypeSummary } from "../../types/MagicTheGathering";
import { getTypeIcon } from "./TypeIcon";
import "./CardTypeSummary.css";

interface TypeSummaryProps {
  summary: CardTypeSummary[];
  hasBorder?: boolean;
}

export function TypeSummary({ summary, hasBorder = false }: TypeSummaryProps) {
  return (
    <div className={`deckCardSummary ${hasBorder ? "hasBorder" : "noBorder"}`}>
      <ul className={hasBorder ? "" : "centredList"}>
        {summary.map(({ type, quantityNeeded }) => {
          let typeLabel = type;
          if (type === "Sorcery") {
            typeLabel = "Sorcerie";
          }

          return (
            <li key={type}>
              {getTypeIcon(type)}
              {`${typeLabel}s (${quantityNeeded})`}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
