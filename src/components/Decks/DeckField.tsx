import "../styles.css";

interface Props {
  customRender?: React.ReactNode;
  editable: boolean;
  onChange: (value: string) => void;
  placeholder: string;
  type?: "text" | "textarea" | "select";
  value: string;
}

export const DeckField = ({
  customRender,
  editable,
  onChange,
  placeholder,
  type = "text",
  value,
}: Props) => {
  // If not editable, render the node or text value
  if (!editable) return customRender ?? <p>{value}</p>;

  // If editable, render the proper form field
  if (type === "textarea") {
    return (
      <textarea
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        value={value}
      />
    );
  } else if (type === "select") {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="Commander">Commander</option>
        <option value="Standard">Standard</option>
      </select>
    );
  } else {
    return (
      <input
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type="text"
        value={value}
      />
    );
  }
};
