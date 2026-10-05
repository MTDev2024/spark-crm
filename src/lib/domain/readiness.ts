import type { Channel, Prospect, ProspectContactField } from "@/types/domain";

/**
 * Complétude ≠ exploitabilité : chaque action exige seulement les champs
 * qui lui sont nécessaires. Aucune information n'est requise pour qualifier.
 */
const requirementsByChannel: Record<Channel, ProspectContactField[]> = {
  phone: ["phone"],
  visit: ["address"],
  email: ["email"],
  message: [],
  meeting: [],
};

export type Readiness = {
  ready: boolean;
  missing: ProspectContactField[];
};

type ContactInfo = Pick<Prospect, ProspectContactField>;

export function getChannelReadiness(
  prospect: ContactInfo,
  channel: Channel,
): Readiness {
  const missing = requirementsByChannel[channel].filter((field) => {
    const value = prospect[field];
    return value === null || value.trim() === "";
  });
  return { ready: missing.length === 0, missing };
}

export function canQualify(): Readiness {
  return { ready: true, missing: [] };
}
