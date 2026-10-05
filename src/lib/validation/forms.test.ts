import { describe, expect, it } from "vitest";
import { dataPointFormSchema } from "./data-point";
import { interactionFormSchema } from "./interaction";
import { prospectFormSchema } from "./prospect";

describe("prospectFormSchema", () => {
  it("accepte une fiche réduite au nom et convertit le vide en null", () => {
    const result = prospectFormSchema.parse({
      company: " Salon Zen ",
      contactName: "",
      contactRole: "",
      activity: "",
      category: "",
      address: "",
      city: "",
      phone: "",
      email: "",
    });
    expect(result.company).toBe("Salon Zen");
    expect(result.email).toBeNull();
    expect(result.phone).toBeNull();
  });

  it("refuse un nom vide et un email invalide", () => {
    const base = {
      contactName: "",
      contactRole: "",
      activity: "",
      category: "",
      address: "",
      city: "",
      phone: "",
    };
    expect(
      prospectFormSchema.safeParse({ ...base, company: "", email: "" }).success,
    ).toBe(false);
    expect(
      prospectFormSchema.safeParse({ ...base, company: "X", email: "pas-un-mail" })
        .success,
    ).toBe(false);
  });
});

describe("interactionFormSchema", () => {
  const base = {
    occurredAt: "2026-10-05",
    channel: "phone",
    objective: "",
    outcome: "",
    notes: "",
    actionObjective: "",
    actionDueAt: "",
  };

  it("exige de choisir entre une prochaine action et « aucune »", () => {
    expect(interactionFormSchema.safeParse(base).success).toBe(false);
  });

  it("accepte « aucune prochaine action » explicite", () => {
    expect(
      interactionFormSchema.safeParse({ ...base, nextChoice: "none" }).success,
    ).toBe(true);
  });

  it("exige un objectif si une prochaine action est choisie", () => {
    expect(
      interactionFormSchema.safeParse({ ...base, nextChoice: "action" }).success,
    ).toBe(false);
    expect(
      interactionFormSchema.safeParse({
        ...base,
        nextChoice: "action",
        actionObjective: "Rappeler",
      }).success,
    ).toBe(true);
  });
});

describe("dataPointFormSchema", () => {
  const base = {
    key: "Logiciel de réservation",
    value: "",
    kind: "fact",
    source: "",
    collectedAt: "",
  };

  it("refuse une donnée confirmée sans valeur", () => {
    expect(
      dataPointFormSchema.safeParse({ ...base, status: "confirmed" }).success,
    ).toBe(false);
  });

  it("accepte « recherché, introuvable » sans valeur", () => {
    expect(
      dataPointFormSchema.safeParse({ ...base, status: "searched_not_found" })
        .success,
    ).toBe(true);
  });
});
