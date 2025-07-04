import "./Card.css";

interface CardHeaderProps {
  isMobile?: boolean;
  quantityOwned: number;
  quantityNeeded: number;
}

export function CardHeader({
  isMobile = false,
  quantityNeeded,
  quantityOwned,
}: CardHeaderProps) {
  return (
    <div className={`cardHeader ${isMobile ? "mobileAlwaysVisible" : ""}`}>
      <div className="cardChipTopLeft rounded-br-[100%] rounded-tl-[10%]">
        <p>{`${quantityOwned}/${quantityNeeded}`}</p>
      </div>
    </div>
  );
}
