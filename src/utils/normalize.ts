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

export function normalizeCardType(type?: string) {
  if (!type) return undefined;

  if (type.includes("Creature")) return "Creature";
  if (type.includes("Sorcery")) return "Sorcery";
  if (type.includes("Instant")) return "Instant";
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
    type == "Basic" ||
    type.includes("Land") ||
    type == "Basic Land"
  ) {
    return (type = "Land");
  }
  if (type.includes("Planeswalker")) return "Creature";
  if (type.includes("Artifact")) return "Artifact";

  // Default
  return type;
}

export type SetMap = Record<string, string>;
let scryfallSetMap: SetMap = {};
let setCodeToNameMap: Record<string, string> = {};
let setNameToCodeMap: Record<string, string> = {};

export async function fetchScryfallSetMaps() {
  const cacheKey = "scryfallSetMap";

  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      setCodeToNameMap = parsed.setCodeToNameMap;
      setNameToCodeMap = parsed.setNameToCodeMap;

      return { setCodeToNameMap, setNameToCodeMap };
    } catch (error) {
      console.warn("Invalid cache with:", error);
    }
  }

  const response = await fetch("https://api.scryfall.com/sets");
  if (!response.ok) throw new Error("Failed to fetch sets from Scryfall");

  const data = await response.json();

  setCodeToNameMap = {};
  setNameToCodeMap = {};

  for (const set of data.data) {
    setCodeToNameMap[set.code.toLowerCase()] = set.name.toLowerCase();
    setNameToCodeMap[set.name.toLowerCase()] = set.code.toLowerCase();
  }

  localStorage.setItem(
    cacheKey,
    JSON.stringify({ setCodeToNameMap, setNameToCodeMap })
  );

  return { setCodeToNameMap, setNameToCodeMap };
}

export function normalizeSet(setCode: string): string {
  return scryfallSetMap[setCode.toLowerCase()] ?? setCode;
}
