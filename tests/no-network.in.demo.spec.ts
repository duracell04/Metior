import { beforeAll, describe, expect, it } from "vitest";

// Enforce "no network" globally for demo runs
beforeAll(() => {
  if (process.env.MEO_OFFLINE === "1" || process.env.MEO_FREEZE_DATE) {
    const stub = (url: any) => {
      throw new Error(`Network call blocked in offline demo: ${String(url)}`);
    };
    (global as any).fetch = stub;
  }
});

describe("offline demo process guard", () => {
  it("process is running in offline demo mode", () => {
    expect(process.env.MEO_OFFLINE === "1" || Boolean(process.env.MEO_FREEZE_DATE)).toBe(true);
  });

  it("no external fetch is attempted in demo", async () => {
    const { getMeoSnapshot } = await import("@/lib/meo-data");
    const snap = await getMeoSnapshot();
    expect(snap.date).toBe("2025-10-08");
  });
});
