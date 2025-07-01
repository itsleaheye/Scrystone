import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [match, setMatch] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== match) setMatch(media.matches);

    const listener = () => setMatch(media.matches);
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, [match, query]);

  return match;
}
