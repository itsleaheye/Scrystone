import "../../styles.css";
import "../Deck.css";
import manaBlack from "../../../assets/manaBlack.svg";
import manaGreen from "../../../assets/manaGreen.svg";
import manaWhite from "../../../assets/manaWhite.svg";
import manaBlue from "../../../assets/manaBlue.svg";
import manaRed from "../../../assets/manaRed.svg";
import manaDefault from "../../../assets/manaDefault.svg";

export const manaIcon: Record<string, string> = {
  B: manaBlack,
  W: manaWhite,
  U: manaBlue,
  G: manaGreen,
  R: manaRed,
};

interface ManaRowProps {
  colours?: string[];
}

export function ManaRow({ colours }: ManaRowProps) {
  if (!colours || colours.length === 0) {
    return <></>;
  }

  return (
    <div className="manaRow">
      {colours.map((manaColour, index) => {
        const src = manaIcon[manaColour] || manaDefault;

        return (
          <img
            key={index}
            src={src}
            alt={`${manaColour} mana symbol`}
            className="manaIcon"
          />
        );
      })}
    </div>
  );
}
