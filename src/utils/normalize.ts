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

export type SetMap = Record<string, string>;
let scryfallSetMap: SetMap = {};

export async function fetchScryfallSetMap(): Promise<SetMap> {
  const cacheKey = "scryfallSetMap";

  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      scryfallSetMap = JSON.parse(cached);
      return scryfallSetMap;
    } catch (err) {
      console.warn("Invalid cache. Fetching from Scryfall...");
    }
  }

  const response = await fetch("https://api.scryfall.com/sets");
  if (!response.ok) throw new Error("Failed to fetch sets from Scryfall");

  const data = await response.json();

  scryfallSetMap = {};
  for (const set of data.data) {
    scryfallSetMap[set.code.toLowerCase()] = set.name;
  }

  localStorage.setItem(cacheKey, JSON.stringify(scryfallSetMap));
  return scryfallSetMap;
}

export function normalizeSet(setCode: string): string {
  return scryfallSetMap[setCode.toLowerCase()] ?? setCode;
}
