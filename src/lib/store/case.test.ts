import { describe, expect, it } from "vitest";
import { keysToCamel, keysToSnake } from "./case";

describe("conversion de clés", () => {
  it("snake_case → camelCase", () => {
    expect(keysToCamel({ source_id: "s1", non_applicable_contexts: [], name: "x" })).toEqual({
      sourceId: "s1",
      nonApplicableContexts: [],
      name: "x",
    });
  });

  it("camelCase → snake_case, valeurs inchangées", () => {
    expect(keysToSnake({ questionPatterns: ["a"], methodId: null, name: "x" })).toEqual({
      question_patterns: ["a"],
      method_id: null,
      name: "x",
    });
  });
});
