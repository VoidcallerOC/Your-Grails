import { describe, expect, it } from "vitest";
import { sanitizeListingQuery } from "./api";
import { compartmentParam, gradeCompartments, isCompartment } from "./grades";

// The grade facets production returned on 2026-10-01: grades 10, 9 and 8 each under two spellings.
const LIVE = [
  { value: "10", count: 27 },
  { value: "9", count: 19 },
  { value: "8.0", count: 5 },
  { value: "8", count: 4 },
  { value: "10.0", count: 2 },
  { value: "9.0", count: 2 },
  { value: "6", count: 1 },
  { value: "7", count: 1 },
  { value: "8.5", count: 1 },
];

describe("gradeCompartments", () => {
  it("groups production spellings of one grade and keeps every spelling it counted", () => {
    expect(gradeCompartments(LIVE)).toEqual([
      { grade: "10", values: ["10", "10.0"], count: 29 },
      { grade: "9", values: ["9", "9.0"], count: 21 },
      { grade: "8.5", values: ["8.5"], count: 1 },
      { grade: "8", values: ["8.0", "8"], count: 9 },
      { grade: "7", values: ["7"], count: 1 },
      { grade: "6", values: ["6"], count: 1 },
    ]);
  });
  it("skips non-numeric and empty values", () => {
    expect(gradeCompartments([{ value: "Authentic", count: 3 }, { value: " ", count: 1 }])).toEqual([]);
  });
});

describe("compartment filter", () => {
  const [ten, , , eight] = gradeCompartments(LIVE);
  it("filters by every spelling it counted", () => {
    expect(compartmentParam(ten)).toBe("10,10.0");
    expect(compartmentParam(eight)).toBe("8,8.0");
  });
  it("is current only for its exact set of spellings", () => {
    expect(isCompartment("10,10.0", ten)).toBe(true);
    expect(isCompartment("10.0,10", ten)).toBe(true);
    expect(isCompartment("10", ten)).toBe(false);
    expect(isCompartment(undefined, ten)).toBe(false);
  });
  it("survives the search sanitizer intact", () => {
    expect(sanitizeListingQuery({ grade: "10,10.0,10.00" }).grade).toBe("10,10.0,10.00");
  });
});
