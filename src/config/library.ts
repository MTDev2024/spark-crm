import type { LibraryTable } from "@/types/library";

/**
 * DESCRIPTION DES ÉLÉMENTS DE LA BIBLIOTHÈQUE
 *
 * Chaque type d'élément (source, méthode, offre…) est décrit ici par une liste
 * de champs. À partir de cette description, l'application génère
 * automatiquement : le formulaire, la validation (Zod), la liste et la fiche.
 * Pour ajouter un champ : l'ajouter dans la migration SQL puis ici.
 *
 * Types de champs :
 *  - text / textarea : texte (vide = inconnu = null)
 *  - url, date       : texte validé
 *  - number          : entier positif ou nul
 *  - list            : plusieurs valeurs, une par ligne dans le formulaire
 *  - select          : choix parmi des options fixes
 *  - relation        : lien vers un élément d'une autre table
 */

export type SelectOption = { value: string; label: string };

export type FieldDef = {
  /** Nom du champ en camelCase (correspond à la colonne SQL en snake_case). */
  name: string;
  label: string;
  kind: "text" | "textarea" | "url" | "date" | "number" | "list" | "select" | "relation";
  required?: boolean;
  hint?: string;
  options?: SelectOption[];
  /** Pour `relation` : table cible et champ à afficher. */
  relation?: { table: LibraryTable; labelField: string };
  /** Valeur initiale à la création. */
  defaultValue?: string;
  /** false = non affiché dans la fiche résumée (ex. contenu très long). */
  hideInSummary?: boolean;
};

export type EntityConfig = {
  table: LibraryTable;
  /** Segment d'URL : /bibliotheque/<slug> */
  slug: string;
  label: string;
  singular: string;
  description: string;
  /** Champ utilisé comme titre de l'élément. */
  titleField: string;
  /** Champ de tri ; sinon tri par titre. */
  sortField?: string;
  fields: FieldDef[];
  emptyHint: string;
};

export const sourceStatusOptions: SelectOption[] = [
  { value: "raw", label: "Source brute" },
  { value: "analyzed", label: "Analysée" },
  { value: "principles_extracted", label: "Principes extraits" },
  { value: "validated", label: "Validée" },
  { value: "validated_for_use", label: "Validée pour utilisation" },
  { value: "to_review", label: "À revoir" },
  { value: "rejected", label: "Rejetée" },
];

export const sourceTypeOptions: SelectOption[] = [
  { value: "book", label: "Livre" },
  { value: "article", label: "Article" },
  { value: "course", label: "Formation / cours" },
  { value: "video", label: "Vidéo" },
  { value: "document", label: "Document" },
  { value: "other", label: "Autre" },
];

export const methodStatusOptions: SelectOption[] = [
  { value: "draft", label: "Brouillon" },
  { value: "validated", label: "Validée" },
  { value: "archived", label: "Archivée" },
];

const sources: EntityConfig = {
  table: "sources",
  slug: "sources",
  label: "Sources",
  singular: "source",
  description: "Documents et contenus de référence, avec leur statut de validation.",
  titleField: "title",
  emptyHint: "Ajoutez les documents (livres, formations, contenus) dont proviennent vos méthodes.",
  fields: [
    { name: "title", label: "Titre", kind: "text", required: true },
    { name: "author", label: "Auteur", kind: "text" },
    { name: "organization", label: "Organisme", kind: "text" },
    { name: "type", label: "Type", kind: "select", required: true, options: sourceTypeOptions, defaultValue: "other" },
    { name: "url", label: "URL", kind: "url" },
    { name: "publishedAt", label: "Date de publication", kind: "date" },
    { name: "status", label: "Statut", kind: "select", required: true, options: sourceStatusOptions, defaultValue: "raw" },
    { name: "principles", label: "Principes extraits", kind: "list", hint: "Un principe par ligne, reformulé fidèlement à la source" },
    { name: "context", label: "Contexte d'application", kind: "textarea" },
    { name: "content", label: "Contenu / extraits", kind: "textarea", hideInSummary: true },
    { name: "notes", label: "Notes", kind: "textarea" },
  ],
};

const methods: EntityConfig = {
  table: "sales_methods",
  slug: "methodes",
  label: "Méthodes",
  singular: "méthode",
  description:
    "Méthodes commerciales (SPIN, SONCAS, AIDA…) et playbooks. Une méthode validée doit avoir une source.",
  titleField: "name",
  emptyHint: "Ajoutez une méthode en la rattachant à sa source. Son contenu vient de la source, jamais de la mémoire du modèle.",
  fields: [
    { name: "name", label: "Nom", kind: "text", required: true },
    { name: "description", label: "Description", kind: "textarea" },
    { name: "objective", label: "Objectif", kind: "textarea" },
    {
      name: "sourceId",
      label: "Source",
      kind: "relation",
      relation: { table: "sources", labelField: "title" },
      hint: "Obligatoire pour valider la méthode",
    },
    { name: "author", label: "Auteur", kind: "text" },
    { name: "version", label: "Version", kind: "text", required: true, defaultValue: "1" },
    { name: "status", label: "Statut", kind: "select", required: true, options: methodStatusOptions, defaultValue: "draft" },
    { name: "applicableContexts", label: "Contextes applicables", kind: "list", hint: "Un par ligne" },
    { name: "nonApplicableContexts", label: "Contextes non applicables", kind: "list", hint: "Un par ligne" },
    { name: "rules", label: "Règles", kind: "list", hint: "Une par ligne" },
    { name: "examples", label: "Exemples", kind: "list", hint: "Un par ligne" },
    { name: "limitations", label: "Limites", kind: "list", hint: "Une par ligne" },
  ],
};

/** Étapes d'une méthode : gérées depuis la fiche de la méthode (pas de page propre). */
export const methodStepConfig: EntityConfig = {
  table: "sales_method_steps",
  slug: "etapes",
  label: "Étapes",
  singular: "étape",
  description: "Étapes d'une méthode.",
  titleField: "name",
  sortField: "position",
  emptyHint: "Aucune étape définie.",
  fields: [
    { name: "position", label: "Ordre", kind: "number", required: true, hint: "1 = première étape" },
    { name: "name", label: "Nom", kind: "text", required: true },
    { name: "objective", label: "Objectif", kind: "textarea" },
    { name: "instructions", label: "Instructions", kind: "textarea" },
    { name: "questionPatterns", label: "Modèles de questions", kind: "list", hint: "Une par ligne" },
    { name: "signals", label: "Signaux à repérer", kind: "list", hint: "Un par ligne" },
  ],
};

const offers: EntityConfig = {
  table: "offers",
  slug: "offres",
  label: "Offres",
  singular: "offre",
  description: "Prestations, prix, périmètre, livrables, limites et délais.",
  titleField: "name",
  emptyHint: "Ajoutez vos offres réelles. Rien n'est proposé automatiquement.",
  fields: [
    { name: "name", label: "Nom", kind: "text", required: true },
    { name: "price", label: "Prix", kind: "text", hint: "Tel que vous le présentez ; laisser vide si non défini" },
    { name: "scope", label: "Périmètre", kind: "textarea" },
    { name: "deliverables", label: "Livrables", kind: "list", hint: "Un par ligne" },
    { name: "benefits", label: "Bénéfices", kind: "list", hint: "Un par ligne" },
    { name: "limits", label: "Limites", kind: "list", hint: "Une par ligne" },
    { name: "leadTime", label: "Délai", kind: "text" },
    { name: "useCases", label: "Cas d'usage", kind: "list", hint: "Un par ligne" },
  ],
};

const realizations: EntityConfig = {
  table: "realizations",
  slug: "realisations",
  label: "Réalisations",
  singular: "réalisation",
  description: "Projets réalisés utilisables comme preuve, avec leur contexte de pertinence.",
  titleField: "activity",
  emptyHint: "Ajoutez vos réalisations réelles, avec uniquement des résultats vérifiés.",
  fields: [
    { name: "activity", label: "Activité du client", kind: "text", required: true },
    { name: "problem", label: "Problème", kind: "textarea" },
    { name: "solution", label: "Solution", kind: "textarea" },
    { name: "features", label: "Fonctionnalités", kind: "list", hint: "Une par ligne" },
    { name: "results", label: "Résultats", kind: "textarea", hint: "Résultats vérifiés uniquement" },
    { name: "url", label: "URL", kind: "url" },
    { name: "context", label: "Contexte", kind: "textarea" },
    { name: "relevance", label: "Pertinence", kind: "textarea", hint: "Pour quels prospects cette réalisation est-elle un bon exemple ?" },
  ],
};

const salesArguments: EntityConfig = {
  table: "sales_arguments",
  slug: "arguments",
  label: "Arguments",
  singular: "argument",
  description: "Arguments reliés à un problème, un bénéfice et un contexte.",
  titleField: "problem",
  emptyHint: "Ajoutez un argument en partant du problème qu'il résout.",
  fields: [
    { name: "problem", label: "Problème", kind: "text", required: true },
    { name: "benefit", label: "Bénéfice", kind: "textarea" },
    { name: "context", label: "Contexte", kind: "textarea" },
    { name: "objection", label: "Objection associée", kind: "textarea" },
    { name: "answer", label: "Réponse", kind: "textarea" },
  ],
};

const objections: EntityConfig = {
  table: "objections",
  slug: "objections",
  label: "Objections",
  singular: "objection",
  description: "Objections rencontrées, réponses et questions associées.",
  titleField: "wording",
  emptyHint: "Ajoutez les objections que vous rencontrez réellement.",
  fields: [
    { name: "wording", label: "Formulation", kind: "text", required: true },
    { name: "context", label: "Contexte", kind: "textarea" },
    { name: "answer", label: "Réponse", kind: "textarea" },
    { name: "questions", label: "Questions à poser", kind: "list", hint: "Une par ligne" },
    {
      name: "methodId",
      label: "Méthode associée",
      kind: "relation",
      relation: { table: "sales_methods", labelField: "name" },
    },
  ],
};

const rules: EntityConfig = {
  table: "commercial_rules",
  slug: "regles",
  label: "Règles",
  singular: "règle",
  description: "Règles commerciales appliquées à toutes les préparations (ton, limites, principes).",
  titleField: "statement",
  emptyHint: "Ajoutez vos règles, par exemple « partir du problème », « ne pas dénigrer les outils existants ».",
  fields: [
    { name: "statement", label: "Règle", kind: "text", required: true },
    { name: "rationale", label: "Justification", kind: "textarea" },
    {
      name: "sourceId",
      label: "Source",
      kind: "relation",
      relation: { table: "sources", labelField: "title" },
    },
  ],
};

/** Sections de la bibliothèque, dans l'ordre d'affichage. */
export const libraryEntities: EntityConfig[] = [
  methods,
  offers,
  realizations,
  salesArguments,
  objections,
  sources,
  rules,
];

export function getEntityBySlug(slug: string): EntityConfig | undefined {
  return libraryEntities.find((entity) => entity.slug === slug);
}

export const entityByTable: Record<LibraryTable, EntityConfig> = Object.fromEntries(
  [...libraryEntities, methodStepConfig].map((entity) => [entity.table, entity]),
) as Record<LibraryTable, EntityConfig>;
