export function normalizeCardName(name: string): string {
  return name
    .normalize("NFD") // Required for accents
    .replace(/\s*\([^)]+\)/g, "") // Remove all '()' groups
    .split(" - ")[0] // Use only the part before ' - s'
    .split("//")[0] // Use only the part before '//'
    .replace(/^(Checklist Card|Token|Token Card|Emblem|Plane)\s*-\s*/i, "") // Remove prefix
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/"/g, "") // Remove quotation marks
    .trim(); // Remove trailing white spaces
}

export function normalizeDeckName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export function normalizeMana(manaCostStr: string): {
  colours?: string[];
} {
  if (!manaCostStr || typeof manaCostStr !== "string") return {}; // Catches double faced cards which struggle with scryfall

  // manaCostStr comes from Scryfall as '{2}{B}' or '{2}{W}{W}'
  const manaTokens = manaCostStr
    .match(/{([^}]+)}/g)
    ?.map((t) => t.slice(1, -1));
  if (!manaTokens) return {};

  const colours = [
    ...new Set(manaTokens.filter((token) => /^[WUBRG]$/.test(token))),
  ];

  return {
    colours: colours.length ? colours : undefined,
  };
}

export function normalizeColourIdentity(colorIdentity: string[]): string {
  return colorIdentity.map((color) => `{${color}}`).join("");
}

export function normalizeCardType(type?: string) {
  if (!type) return undefined;

  if (type.includes("Artifact")) return "Artifact";
  if (type.includes("Creature")) return "Creature";
  if (type === "Instant") return "Sorcery";
  if (
    ([
      "Swamp",
      "Plains",
      "Mountain",
      "Forest",
      "Island",
      "Reef",
      "Cave",
      "Grotto",
      "Orchard",
    ].includes(type ?? "") &&
      type == "Instant") ||
    type == "Basic"
  ) {
    type = "Land";
  }

  return type;
}

export function normalizeSet(setName: string) {
  switch (setName) {
    case "who":
      return "Doctor Who";
    case "blb":
      return "Bloomburrow";
    case "fin":
      return "Final Fantasy";
    case "pfin":
      return "Final Fantasy Promo";
    default:
      return setName;
  }
}
