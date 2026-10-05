import { describe, expect, it } from "vitest";
import { canQualify, getChannelReadiness } from "./readiness";

const bare = { phone: null, email: null, address: null };

describe("getChannelReadiness", () => {
  it("bloque un appel sans téléphone", () => {
    expect(getChannelReadiness(bare, "phone")).toEqual({
      ready: false,
      missing: ["phone"],
    });
  });

  it("autorise un appel sans email ni adresse", () => {
    expect(
      getChannelReadiness({ ...bare, phone: "0600000000" }, "phone").ready,
    ).toBe(true);
  });

  it("bloque un email sans adresse email", () => {
    expect(getChannelReadiness(bare, "email").missing).toEqual(["email"]);
  });

  it("bloque une visite sans adresse", () => {
    expect(getChannelReadiness(bare, "visit").missing).toEqual(["address"]);
  });

  it("traite une chaîne vide comme absente", () => {
    expect(getChannelReadiness({ ...bare, phone: "  " }, "phone").ready).toBe(
      false,
    );
  });
});

describe("canQualify", () => {
  it("ne dépend d'aucune donnée de contact", () => {
    expect(canQualify().ready).toBe(true);
  });
});
