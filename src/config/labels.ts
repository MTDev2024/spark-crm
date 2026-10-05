import type {
  ActionPriority,
  ActionType,
  Channel,
  DataStatus,
  InfoKind,
  ProspectContactField,
} from "@/types/domain";

/**
 * Libellés français affichés dans l'interface. Les valeurs techniques
 * (clés) restent en anglais dans les types et la base de données.
 */

export const channelLabels: Record<Channel, string> = {
  phone: "Appel",
  visit: "Visite",
  email: "Email",
  message: "Message",
  meeting: "Rendez-vous",
};

export const actionTypeLabels: Record<ActionType, string> = {
  call: "Appel",
  visit: "Visite",
  email: "Email",
  message: "Message",
  follow_up: "Relance",
  meeting: "Rendez-vous",
  qualify: "Qualification",
  other: "Autre",
};

export const priorityLabels: Record<ActionPriority, string> = {
  high: "Haute",
  normal: "Normale",
  low: "Basse",
};

export const dataStatusLabels: Record<DataStatus, string> = {
  confirmed: "Confirmé",
  to_verify: "À vérifier",
  missing: "Manquant",
  searched_not_found: "Recherché, introuvable",
  not_applicable: "Non applicable",
};

export const infoKindLabels: Record<InfoKind, string> = {
  fact: "Fait",
  signal: "Signal",
  hypothesis: "Hypothèse",
};

export const contactFieldLabels: Record<ProspectContactField, string> = {
  phone: "téléphone",
  email: "email",
  address: "adresse",
};
