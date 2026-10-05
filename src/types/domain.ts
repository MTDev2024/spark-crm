/** Statut d'une donnée prospect. Une donnée inconnue reste "missing". */
export type DataStatus =
  | "confirmed"
  | "to_verify"
  | "missing"
  | "searched_not_found"
  | "not_applicable";

/** Nature d'une information : jamais présenter une hypothèse comme un fait. */
export type InfoKind = "fact" | "signal" | "hypothesis";

export type Channel = "phone" | "visit" | "email" | "message" | "meeting";

export type ProspectContactField = "phone" | "email" | "address";

export type DataPoint = {
  key: string;
  value: string | null;
  kind: InfoKind;
  status: DataStatus;
  sourceId: string | null;
  collectedAt: string | null;
  verifiedAt: string | null;
  confidence: number | null;
};

export type Prospect = {
  id: string;
  company: string;
  contactName: string | null;
  contactRole: string | null;
  activity: string | null;
  category: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  createdAt: string;
};

export type DigitalTool = {
  id: string;
  name: string;
  category: string;
};

export type ActionType =
  | "call"
  | "visit"
  | "email"
  | "message"
  | "follow_up"
  | "meeting"
  | "qualify"
  | "other";

export type ActionPriority = "low" | "normal" | "high";

export type Action = {
  id: string;
  prospectId: string;
  type: ActionType;
  objective: string;
  reason: string | null;
  dueAt: string | null;
  priority: ActionPriority;
  doneAt: string | null;
};

export type Interaction = {
  id: string;
  prospectId: string;
  occurredAt: string;
  channel: Channel;
  objective: string | null;
  outcome: string | null;
  notes: string | null;
  /** Une interaction débouche sur une action, ou explicitement sur aucune. */
  nextActionId: string | null;
  noNextAction: boolean;
};

export type SourceStatus =
  | "raw"
  | "analyzed"
  | "principles_extracted"
  | "validated"
  | "validated_for_use"
  | "to_review"
  | "rejected";

export type MethodStatus = "draft" | "validated" | "archived";

export type SalesMethodStep = {
  order: number;
  name: string;
  objective: string;
  instructions: string;
  questionPatterns: string[];
  signals: string[];
};

export type SalesMethod = {
  id: string;
  name: string;
  description: string;
  objective: string;
  /** Obligatoire : une méthode sans source n'est jamais opérationnelle. */
  sourceId: string | null;
  author: string | null;
  version: string;
  status: MethodStatus;
  steps: SalesMethodStep[];
};
