import { describe, expect, it } from "vitest";
import { qualificationSchema } from "./qualification";

const empty = {
  situation: "Informations insuffisantes.",
  activeProblem: null,
  facts: [],
  signals: [],
  hypotheses: [],
  strengths: [],
  weaknesses: [],
  opportunities: [],
  excludedOffers: [],
  knowDo: null,
  recommendedAngle: null,
  objections: [],
  recommendedChannel: null,
  nextAction: null,
};

describe("qualificationSchema", () => {
  it("accepte une conclusion sans opportunité établie", () => {
    expect(qualificationSchema.safeParse(empty).success).toBe(true);
  });

  it("rejette un canal inconnu", () => {
    expect(
      qualificationSchema.safeParse({ ...empty, recommendedChannel: "fax" })
        .success,
    ).toBe(false);
  });

  it("rejette une affirmation vide", () => {
    expect(
      qualificationSchema.safeParse({
        ...empty,
        facts: [{ text: "", sourceId: null }],
      }).success,
    ).toBe(false);
  });
});
