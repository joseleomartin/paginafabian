export type TitleSegment = { text: string; accent: boolean };

/**
 * Divide un título en tramos para resaltar una palabra o frase (`accent`).
 * Si el acento no aparece en el título, devuelve el título completo sin resaltar.
 * Módulo puro para poder testearlo con `node --test`.
 */
export function splitAccent(title: string, accent?: string): TitleSegment[] {
  const index = accent ? title.indexOf(accent) : -1;
  if (!accent || index === -1) return [{ text: title, accent: false }];

  const before = title.slice(0, index);
  const after = title.slice(index + accent.length);

  return [
    { text: before, accent: false },
    { text: accent, accent: true },
    { text: after, accent: false },
  ].filter((segment) => segment.text.length > 0);
}
