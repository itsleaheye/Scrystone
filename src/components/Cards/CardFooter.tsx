import { FaMinus, FaPlus } from "react-icons/fa6";

interface CardFooterProps {
  cardName: string;
  editable: boolean;
  isDeckView: boolean;
  onChangeQuantity: (cardName: string, amount: number) => void;
  quantityNeeded: number;
  quantityOwned: number;
}

export function CardFooter({
  cardName,
  editable,
  isDeckView,
  onChangeQuantity,
  quantityNeeded,
  quantityOwned,
}: CardFooterProps) {
  const quantityChip = (
    <div className="quantity rounded-tr-[100%] rounded-bl-[10%]">
      <p>
        {isDeckView
          ? `${quantityOwned}/${quantityNeeded}`
          : `x${quantityOwned}`}
      </p>
    </div>
  );

  if (isDeckView) {
    const cardChipButton = (icon: React.ReactNode, amount: number) => (
      <div
        onClick={() => onChangeQuantity(cardName, amount)}
        className={`cardChip ${
          amount === -1
            ? "cardChipLeft rounded-tr-[100%] rounded-bl-[20%]"
            : "cardChipRight rounded-tl-[100%] rounded-br-[20%]"
        }`}
      >
        <p>{icon}</p>
      </div>
    );

    if (editable) {
      return (
        <div className="cardFooterGroup">
          <div className="cardFooter">
            {cardChipButton(<FaMinus />, -1)}
            {cardChipButton(<FaPlus />, 1)}
          </div>
          <div className="cardQuantity">{quantityChip}</div>
        </div>
      );
    } else {
      return <div className="cardQuantity">{quantityChip}</div>;
    }
  } else if (quantityOwned > 1) {
    return <>{quantityChip}</>;
  }
}
