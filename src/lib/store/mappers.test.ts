import { describe, expect, it } from "vitest";
import {
  actionFromRow,
  actionToRow,
  dataPointFromRow,
  dataPointToRow,
  interactionFromRow,
  interactionToRow,
  prospectFromRow,
  prospectToRow,
} from "./mappers";

/** Aller-retour : application → base → application doit redonner l'objet d'origine. */
describe("mappers", () => {
  it("prospect", () => {
    const prospect = {
      id: "p1",
      company: "Salon Zen",
      contactName: null,
      contactRole: null,
      activity: "Coiffure",
      category: null,
      address: null,
      city: "Lille",
      phone: null,
      email: null,
      createdAt: "2026-10-05T10:00:00Z",
    };
    expect(prospectFromRow(prospectToRow(prospect) as never)).toEqual(prospect);
  });

  it("action", () => {
    const action = {
      id: "a1",
      prospectId: "p1",
      type: "call" as const,
      objective: "Rappeler",
      reason: null,
      dueAt: "2026-10-06",
      priority: "high" as const,
      doneAt: null,
    };
    expect(actionFromRow(actionToRow(action))).toEqual(action);
  });

  it("interaction avec « aucune prochaine action »", () => {
    const interaction = {
      id: "i1",
      prospectId: "p1",
      occurredAt: "2026-10-05",
      channel: "phone" as const,
      objective: null,
      outcome: "Pas de réponse",
      notes: null,
      nextActionId: null,
      noNextAction: true,
    };
    expect(interactionFromRow(interactionToRow(interaction))).toEqual(interaction);
  });

  it("donnée prospect : une valeur inconnue reste null", () => {
    const point = {
      id: "d1",
      prospectId: "p1",
      key: "Planity",
      value: null,
      kind: "fact" as const,
      status: "searched_not_found" as const,
      source: null,
      collectedAt: null,
      verifiedAt: null,
      confidence: null,
    };
    const back = dataPointFromRow(dataPointToRow(point));
    expect(back).toEqual(point);
    expect(back.value).toBeNull();
  });
});
