/**
 * Conversion des noms de champs entre la base (snake_case) et l'application
 * (camelCase) pour les éléments de la bibliothèque. Seules les clés changent,
 * jamais les valeurs. (Les prospects utilisent mappers.ts, écrit champ par champ.)
 */

const toCamel = (key: string) =>
  key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());

const toSnake = (key: string) =>
  key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

export function keysToCamel<T extends Record<string, unknown>>(
  row: Record<string, unknown>,
): T {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [toCamel(key), value]),
  ) as T;
}

export function keysToSnake(item: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(item).map(([key, value]) => [toSnake(key), value]),
  );
}
