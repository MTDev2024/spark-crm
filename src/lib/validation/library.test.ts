import { describe, expect, it } from "vitest";
import { entityByTable } from "@/config/library";
import { buildEntitySchema } from "./library";

const methodSchema = buildEntitySchema(entityByTable.sales_methods);
const sourceSchema = buildEntitySchema(entityByTable.sources);
const stepSchema = buildEntitySchema(entityByTable.sales_method_steps);

const baseMethod = {
  name: "SPIN",
  description: "",
  objective: "",
  sourceId: "",
  author: "",
  version: "1",
  status: "draft",
  applicableContexts: "",
  nonApplicableContexts: "",
  rules: "",
  examples: "",
  limitations: "",
};

describe("schéma des méthodes", () => {
  it("accepte un brouillon sans source", () => {
    const result = methodSchema.safeParse(baseMethod);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.sourceId).toBeNull();
  });

  it("refuse une méthode validée sans source", () => {
    const result = methodSchema.safeParse({ ...baseMethod, status: "validated" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toEqual(["sourceId"]);
  });

  it("accepte une méthode validée avec une source", () => {
    expect(
      methodSchema.safeParse({
        ...baseMethod,
        status: "validated",
        sourceId: "3f2b1c7e-8a4d-4d5e-9b0a-1c2d3e4f5a6b",
      }).success,
    ).toBe(true);
  });

  it("transforme une liste multi-lignes en tableau sans lignes vides", () => {
    const result = methodSchema.parse({
      ...baseMethod,
      rules: "Règle A\n\n  Règle B  \n",
    });
    expect(result.rules).toEqual(["Règle A", "Règle B"]);
  });
});

describe("schéma des sources", () => {
  const base = {
    title: "Livre X",
    author: "",
    organization: "",
    type: "book",
    url: "",
    publishedAt: "",
    status: "raw",
    principles: "",
    context: "",
    content: "",
    notes: "",
  };

  it("refuse un statut inconnu", () => {
    expect(sourceSchema.safeParse({ ...base, status: "inventé" }).success).toBe(false);
  });

  it("refuse une URL invalide mais accepte une URL vide", () => {
    expect(sourceSchema.safeParse({ ...base, url: "pas une url" }).success).toBe(false);
    expect(sourceSchema.safeParse(base).success).toBe(true);
  });
});

describe("schéma des étapes", () => {
  it("convertit l'ordre en nombre et le exige", () => {
    const base = {
      name: "Situation",
      objective: "",
      instructions: "",
      questionPatterns: "",
      signals: "",
    };
    expect(stepSchema.parse({ ...base, position: "2" }).position).toBe(2);
    expect(stepSchema.safeParse({ ...base, position: "" }).success).toBe(false);
  });
});
