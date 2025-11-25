import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

import { fetchJson, isOffline } from "@/lib/http";

const OLD_ENV = { ...process.env };

describe("HTTP offline fuse", () => {
  beforeEach(() => {
    vi.resetModules();
    Object.assign(process.env, OLD_ENV);
    (global as any).fetch = undefined;
  });

  afterEach(() => {
    Object.assign(process.env, OLD_ENV);
    vi.restoreAllMocks();
  });

  it.each([
    { name: "MEO_OFFLINE=1", env: { MEO_OFFLINE: "1" } },
    { name: "MEO_FREEZE_DATE set", env: { MEO_FREEZE_DATE: "2025-10-08" } },
  ])("hard fuse blocks network when %s", async ({ env }) => {
    Object.assign(process.env, env);
    expect(isOffline()).toBe(true);

    const spy = vi.fn().mockRejectedValue(new Error("should not be called"));
    (global as any).fetch = spy;

    await expect(fetchJson("https://example.com")).rejects.toThrowError(
      /offline demo: network disabled \(fetchJson called\)/
    );
    expect(spy).not.toHaveBeenCalled();
  });

  it("soft fuse returns stub and avoids network", async () => {
    process.env.MEO_OFFLINE = "1";
    const spy = vi.fn().mockRejectedValue(new Error("should not be called"));
    (global as any).fetch = spy;

    const res = await fetchJson("https://example.com", { soft: true });
    expect(res).toEqual({});
    expect(spy).not.toHaveBeenCalled();
  });

  it("passes through in live mode and decodes JSON", async () => {
    delete process.env.MEO_OFFLINE;
    delete process.env.MEO_FREEZE_DATE;

    const mock = { ok: true };
    (global as any).fetch = vi.fn(async () =>
      new Response(JSON.stringify(mock), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    );

    const out = await fetchJson<typeof mock>("https://example.com");
    expect(out).toEqual(mock);
    expect((global as any).fetch).toHaveBeenCalledTimes(1);
  });

  it("aborts on timeout", async () => {
    delete process.env.MEO_OFFLINE;
    (global as any).fetch = vi.fn(
      () =>
        new Promise((_res, _rej) => {
          /* never resolve — simulate hang */
        })
    );

    await expect(fetchJson("https://slow.example", { timeoutMs: 5 })).rejects.toThrow();
  });
});
