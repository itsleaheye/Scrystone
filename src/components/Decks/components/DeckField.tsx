import "../../styles.css";

interface Props {
  onChange: (value: string) => void;
  placeholder: string;
  type?: "text" | "textarea" | "select";
  value: string;
}

export const DeckField = ({
  onChange,
  placeholder,
  type = "text",
  value,
}: Props) => {
  // If editable, render the proper form field
  if (type === "textarea") {
    return (
      <textarea
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        value={value}
        maxLength={375}
      />
    );
  } else if (type === "select") {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="Commander">Commander</option>
        <option value="Standard">Standard</option>
        <option value="Draft">Draft</option>
      </select>
    );
  } else {
    return (
      <input
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type="text"
        value={value}
        maxLength={100}
      />
    );
  }
};
