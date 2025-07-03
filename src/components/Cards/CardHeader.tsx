import "./Card.css";

interface CardHeaderProps {
  quantityOwned: number;
  quantityNeeded: number;
}

export function CardHeader({ quantityNeeded, quantityOwned }: CardHeaderProps) {
  return (
    <div className="cardHeader">
      <div className="cardChipTopLeft rounded-br-[100%] rounded-tl-[10%]">
        <p>{`${quantityOwned}/${quantityNeeded}`}</p>
      </div>
    </div>
  );
}
