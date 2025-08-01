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
        {summary.map(({ type, quantityNeeded, quantityOwned }) => {
          let typeLabel = type;
          if (type === "Sorcery" || type === "Instant") {
            typeLabel = "Sorcerie";
          }

          const showWarning = (quantityOwned ?? 0) < (quantityNeeded ?? 1);

          return (
            <li key={type}>
              {/* <span className={showWarning ? "redText" : ""}> */}
              {getTypeIcon(type)}
              {/* </span> */}
              {typeLabel}s
              <span
                className={`${
                  quantityNeeded !== quantityOwned &&
                  quantityNeeded !== 0 &&
                  hasBorder
                    ? "bold"
                    : undefined
                } ${showWarning ? "redText bold" : ""}`}
              >
                &nbsp;&nbsp;{quantityOwned}/{quantityNeeded}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
