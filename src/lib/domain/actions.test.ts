import { describe, expect, it } from "vitest";
import type { Action, Prospect } from "@/types/domain";
import {
  getBucket,
  groupOpenActions,
  prospectsWithoutNextAction,
  sortActions,
  toDateString,
} from "./actions";

const TODAY = "2026-10-05";

function action(overrides: Partial<Action> = {}): Action {
  return {
    id: "a",
    prospectId: "p1",
    type: "call",
    objective: "Appeler",
    reason: null,
    dueAt: TODAY,
    priority: "normal",
    doneAt: null,
    ...overrides,
  };
}

function prospect(id: string): Prospect {
  return {
    id,
    company: id,
    contactName: null,
    contactRole: null,
    activity: null,
    category: null,
    address: null,
    city: null,
    phone: null,
    email: null,
    createdAt: "2026-10-01",
  };
}

describe("toDateString", () => {
  it("formate en YYYY-MM-DD avec zéros", () => {
    expect(toDateString(new Date(2026, 0, 3))).toBe("2026-01-03");
  });
});

describe("getBucket", () => {
  it("classe en retard, aujourd'hui, à venir, sans date", () => {
    expect(getBucket(action({ dueAt: "2026-10-04" }), TODAY)).toBe("overdue");
    expect(getBucket(action({ dueAt: TODAY }), TODAY)).toBe("today");
    expect(getBucket(action({ dueAt: "2026-10-06" }), TODAY)).toBe("upcoming");
    expect(getBucket(action({ dueAt: null }), TODAY)).toBe("no_date");
  });
});

describe("sortActions", () => {
  it("trie par échéance, sans échéance en dernier, puis par priorité", () => {
    const sorted = sortActions([
      action({ id: "none", dueAt: null }),
      action({ id: "late", dueAt: "2026-10-09" }),
      action({ id: "soon-low", dueAt: "2026-10-06", priority: "low" }),
      action({ id: "soon-high", dueAt: "2026-10-06", priority: "high" }),
    ]);
    expect(sorted.map((a) => a.id)).toEqual([
      "soon-high",
      "soon-low",
      "late",
      "none",
    ]);
  });

  it("ne modifie pas le tableau d'origine", () => {
    const input = [action({ id: "b", dueAt: "2026-10-09" }), action({ id: "a" })];
    sortActions(input);
    expect(input[0].id).toBe("b");
  });
});

describe("groupOpenActions", () => {
  it("ignore les actions terminées", () => {
    const groups = groupOpenActions(
      [action({ id: "done", doneAt: "2026-10-05" }), action({ id: "open" })],
      TODAY,
    );
    expect(groups.today.map((a) => a.id)).toEqual(["open"]);
  });
});

describe("prospectsWithoutNextAction", () => {
  it("retourne les prospects sans action à faire", () => {
    const result = prospectsWithoutNextAction(
      [prospect("p1"), prospect("p2"), prospect("p3")],
      [
        action({ prospectId: "p1" }),
        action({ prospectId: "p2", doneAt: "2026-10-04" }),
      ],
    );
    expect(result.map((p) => p.id)).toEqual(["p2", "p3"]);
  });
});
