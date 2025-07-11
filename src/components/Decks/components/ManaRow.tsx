import "../../styles.css";
import "../Deck.css";

const manaColourMap: Record<string, string> = {
  B: "black",
  W: "white",
  U: "blue",
  G: "green",
  R: "red",
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
        const className = manaColourMap[manaColour] ?? "";

        return <span key={index} className={`manaPlaceholder ${className}`} />;
      })}
    </div>
  );
}
