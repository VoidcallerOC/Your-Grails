import { afterEach, describe, expect, it, vi } from "vitest";
import { buildPath, errorMessage, ygGet, YgApiError } from "./yg-api";

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.YG_API_BASE_URL;
});

const respond = (status: number, body: unknown) =>
  vi.fn(async (_url: string) => new Response(typeof body === "string" ? body : JSON.stringify(body), { status, statusText: status === 200 ? "OK" : "Error" }));

describe("buildPath", () => {
  it("drops empty params and encodes values", () => {
    expect(buildPath("/listings", { page: 2, query: "dark espeon", grade: "", set: undefined })).toBe("/listings?page=2&query=dark+espeon");
    expect(buildPath("/packs")).toBe("/packs");
  });
});

describe("errorMessage", () => {
  it("reads the error shapes production returns", () => {
    expect(errorMessage({ error: { message: "Not found" } }, "x")).toBe("Not found");
    expect(errorMessage({ error: "Bad input" }, "x")).toBe("Bad input");
    expect(errorMessage({ message: "Nope" }, "x")).toBe("Nope");
    expect(errorMessage(null, "Gateway Timeout")).toBe("Gateway Timeout");
  });
});

describe("ygGet", () => {
  it("calls the production base by default and unwraps data", async () => {
    const f = respond(200, { success: true, data: [1, 2] });
    vi.stubGlobal("fetch", f);
    await expect(ygGet("/packs")).resolves.toEqual([1, 2]);
    expect(f.mock.calls[0][0]).toBe("https://api.yourgrails.com/api/packs");
  });
  it("honors YG_API_BASE_URL", async () => {
    process.env.YG_API_BASE_URL = "https://staging.example/api/";
    const f = respond(200, { success: true, data: {} });
    vi.stubGlobal("fetch", f);
    await ygGet("/x");
    expect(f.mock.calls[0][0]).toBe("https://staging.example/api/x");
  });
  it("throws a typed error on HTTP failure", async () => {
    vi.stubGlobal("fetch", respond(404, { error: { message: "Listing not found" } }));
    await expect(ygGet("/listings/1")).rejects.toMatchObject({ name: "YgApiError", status: 404, message: "Listing not found" });
  });
  it("throws when the envelope reports failure", async () => {
    vi.stubGlobal("fetch", respond(200, { success: false, error: "Paused" }));
    await expect(ygGet("/packs")).rejects.toBeInstanceOf(YgApiError);
  });
  it("reports an unreachable API without inventing data", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("fetch failed"); }));
    await expect(ygGet("/packs")).rejects.toMatchObject({ status: 0, message: "YourGrails could not be reached." });
  });
});
