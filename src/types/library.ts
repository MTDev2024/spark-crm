/**
 * Types de la base commerciale (bibliothèque).
 * Correspondent aux tables de supabase/migrations/20261006000000_commercial_library.sql.
 */

export type SourceStatus =
  | "raw"
  | "analyzed"
  | "principles_extracted"
  | "validated"
  | "validated_for_use"
  | "to_review"
  | "rejected";

export type SourceType =
  | "book"
  | "article"
  | "course"
  | "video"
  | "document"
  | "other";

export type MethodStatus = "draft" | "validated" | "archived";

/** Noms des tables de la bibliothèque. */
export type LibraryTable =
  | "sources"
  | "sales_methods"
  | "sales_method_steps"
  | "offers"
  | "realizations"
  | "sales_arguments"
  | "objections"
  | "commercial_rules";

/**
 * Élément de bibliothèque tel que manipulé par l'interface : un objet plat
 * dont les clés sont les champs (camelCase). Les champs précis de chaque type
 * sont décrits dans src/config/library.ts et validés par Zod.
 */
export type LibraryItem = { id: string } & Record<string, unknown>;
