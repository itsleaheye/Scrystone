import "./EmptyView.css";

interface EmptyViewProps {
  description: string;
  title: string;
}

export function EmptyView({ title, description }: EmptyViewProps) {
  return (
    <div className="emptyInfo">
      <div className="flexCol">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}
