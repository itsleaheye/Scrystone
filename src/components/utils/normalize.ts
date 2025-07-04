export function normalizeCardName(name: string): string {
  return name
    .replace(/\s*\([^)]+\)/g, "") // Remove all '()' groups
    .split(" - ")[0] // Use only the part before ' - s'
    .split("//")[0] // Use only the part before '//'
    .replace(/^(Checklist Card|Token|Token Card|Emblem|Plane)\s*-\s*/i, "") // Remove prefix
    .replace(/"/g, "") // Remove quotation marks
    .trim(); // Remove trailing white spaces
}

export function normalizeDeckName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export function normalizeMana(manaCostStr: string): {
  cost?: number;
  colours?: string[];
} {
  // manaCostStr comes from Scryfall as '{2}{B}' or '{2}{W}{W}'
  const manaTokens = manaCostStr
    .match(/{([^}]+)}/g)
    ?.map((t) => t.slice(1, -1));
  if (!manaTokens) return {};

  const cost = manaTokens.find((token) => /^\d+$/.test(token));
  const colours = manaTokens.filter((token) => /^[WUBRG]$/.test(token));

  return {
    cost: cost ? parseInt(cost, 10) : undefined,
    colours: colours.length ? colours : undefined,
  };
}

export function normalizeColourIdentity(colorIdentity: string[]): string {
  return colorIdentity.map((color) => `{${color}}`).join("");
}

export function normalizeCardType(type?: string) {
  if (!type) return undefined;

  if (type === "Legendary") return "Creature";
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
