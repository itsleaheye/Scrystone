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
  const showWarning = quantityOwned < quantityNeeded && quantityNeeded > 0;
  return (
    <div className={`cardHeader ${isMobile ? "mobileAlwaysVisible" : ""}`}>
      <div className="cardChipTopLeft rounded-br-[100%] rounded-tl-[10%]">
        <p
          style={{ color: showWarning ? "var(--red)" : "var(--white)" }}
        >{`x${quantityNeeded}`}</p>
      </div>
    </div>
  );
}
