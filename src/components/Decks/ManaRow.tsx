import "../styles.css";

const manaColourMap: Record<string, string> = {
  B: "black",
  W: "white",
  U: "blue",
  G: "green",
  R: "red",
};

interface ManaRowProps {
  colours: string[];
}

export function ManaRow({ colours }: ManaRowProps) {
  return (
    <div className="manaRow">
      {colours.map((manaColour, index) => {
        const className = manaColourMap[manaColour] ?? "";

        return <span key={index} className={`manaPlaceholder ${className}`} />;
      })}
    </div>
  );
}
