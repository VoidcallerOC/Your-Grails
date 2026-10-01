import type { Facet } from "./types";

/*
 * Production stores a card's grade as free text, so one grade can arrive under several spellings
 * ("10" and "10.0" were both live on 2026-10-01). The facets endpoint counts each spelling separately and the
 * listings endpoint filters by exact spelling, accepting several comma-separated. A compartment therefore groups
 * the spellings of one grade and filters by every spelling it counted, so its count and its results are one population.
 */

export type Compartment = { grade: string; values: string[]; count: number };

/** One compartment per numeric grade, highest first, carrying the exact production spellings it counts. */
export function gradeCompartments(facets: Facet[]): Compartment[] {
  const by = new Map<string, Compartment>();
  for (const f of facets) {
    const n = Number(f.value);
    if (!f.value.trim() || !Number.isFinite(n)) continue;
    const grade = String(n);
    const c = by.get(grade) ?? { grade, values: [], count: 0 };
    c.values.push(f.value);
    c.count += f.count;
    by.set(grade, c);
  }
  return [...by.values()].sort((a, b) => Number(b.grade) - Number(a.grade));
}

/** The `grade` search value for a compartment: every spelling it counted. */
export const compartmentParam = (c: Compartment) => [...c.values].sort().join(",");

/** True when the current `grade` filter is exactly this compartment's set of spellings. */
export function isCompartment(grade: string | undefined, c: Compartment) {
  if (!grade) return false;
  const want = [...c.values].sort();
  const have = [...new Set(grade.split(",").map((v) => v.trim()))].sort();
  return have.length === want.length && have.every((v, i) => v === want[i]);
}

