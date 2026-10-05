import type {
  Action,
  Interaction,
  Prospect,
  StoredDataPoint,
} from "@/types/domain";

/**
 * Conversions entre les lignes de la base (snake_case, voir
 * supabase/migrations) et les objets de l'application (camelCase,
 * voir src/types/domain.ts). Fonctions pures, donc testables.
 *
 * Les colonnes `user_id` et `created_at` ne sont pas envoyées à l'écriture :
 * la base les remplit elle-même (utilisateur connecté, date du jour).
 */

/* Lignes telles que renvoyées par la base. */
export type ProspectRow = {
  id: string;
  company: string;
  contact_name: string | null;
  contact_role: string | null;
  activity: string | null;
  category: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
};

export type ActionRow = {
  id: string;
  prospect_id: string;
  type: Action["type"];
  objective: string;
  reason: string | null;
  due_at: string | null;
  priority: Action["priority"];
  done_at: string | null;
};

export type InteractionRow = {
  id: string;
  prospect_id: string;
  occurred_at: string;
  channel: Interaction["channel"];
  objective: string | null;
  outcome: string | null;
  notes: string | null;
  next_action_id: string | null;
  no_next_action: boolean;
};

export type DataPointRow = {
  id: string;
  prospect_id: string;
  key: string;
  value: string | null;
  kind: StoredDataPoint["kind"];
  status: StoredDataPoint["status"];
  source: string | null;
  collected_at: string | null;
  verified_at: string | null;
  confidence: number | null;
};

/* Base → application. */

export const prospectFromRow = (r: ProspectRow): Prospect => ({
  id: r.id,
  company: r.company,
  contactName: r.contact_name,
  contactRole: r.contact_role,
  activity: r.activity,
  category: r.category,
  address: r.address,
  city: r.city,
  phone: r.phone,
  email: r.email,
  createdAt: r.created_at,
});

export const actionFromRow = (r: ActionRow): Action => ({
  id: r.id,
  prospectId: r.prospect_id,
  type: r.type,
  objective: r.objective,
  reason: r.reason,
  dueAt: r.due_at,
  priority: r.priority,
  doneAt: r.done_at,
});

export const interactionFromRow = (r: InteractionRow): Interaction => ({
  id: r.id,
  prospectId: r.prospect_id,
  occurredAt: r.occurred_at,
  channel: r.channel,
  objective: r.objective,
  outcome: r.outcome,
  notes: r.notes,
  nextActionId: r.next_action_id,
  noNextAction: r.no_next_action,
});

export const dataPointFromRow = (r: DataPointRow): StoredDataPoint => ({
  id: r.id,
  prospectId: r.prospect_id,
  key: r.key,
  value: r.value,
  kind: r.kind,
  status: r.status,
  source: r.source,
  collectedAt: r.collected_at,
  verifiedAt: r.verified_at,
  confidence: r.confidence,
});

/* Application → base (pour insert / update). */

/** Champs modifiables d'un prospect (tout sauf id et date de création). */
export const prospectFieldsToRow = (
  p: Omit<Prospect, "id" | "createdAt">,
) => ({
  company: p.company,
  contact_name: p.contactName,
  contact_role: p.contactRole,
  activity: p.activity,
  category: p.category,
  address: p.address,
  city: p.city,
  phone: p.phone,
  email: p.email,
});

export const prospectToRow = (p: Prospect) => ({
  id: p.id,
  created_at: p.createdAt,
  ...prospectFieldsToRow(p),
});

export const actionToRow = (a: Action) => ({
  id: a.id,
  prospect_id: a.prospectId,
  type: a.type,
  objective: a.objective,
  reason: a.reason,
  due_at: a.dueAt,
  priority: a.priority,
  done_at: a.doneAt,
});

export const interactionToRow = (i: Interaction) => ({
  id: i.id,
  prospect_id: i.prospectId,
  occurred_at: i.occurredAt,
  channel: i.channel,
  objective: i.objective,
  outcome: i.outcome,
  notes: i.notes,
  next_action_id: i.nextActionId,
  no_next_action: i.noNextAction,
});

export const dataPointToRow = (d: StoredDataPoint) => ({
  id: d.id,
  prospect_id: d.prospectId,
  key: d.key,
  value: d.value,
  kind: d.kind,
  status: d.status,
  source: d.source,
  collected_at: d.collectedAt,
  verified_at: d.verifiedAt,
  confidence: d.confidence,
});
