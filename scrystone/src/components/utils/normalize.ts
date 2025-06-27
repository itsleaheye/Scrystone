export function normalizeCardName(name: string): string {
  return name
    .replace(/\s*\([^)]+\)/g, "") // Remove all '()' groups
    .split(" - ")[0] // Use only the part before ' - s'
    .split("//")[0] // Use only the part before '//'
    .replace(/^(Checklist Card|Token|Token Card|Emblem|Plane)\s*-\s*/i, "") // Remove prefix
    .replace(/"/g, "") // Remove quotation marks
    .trim(); // Remove trailing white spaces
}

export function normalizeMana(manaCostStr: string): {
  cost?: number;
  colours?: string[];
} {
  console.log("manaCostStr", manaCostStr);
  // manaCostStr comes from scryfall as '{2}{B}' or '{2}{W}{W}'
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
