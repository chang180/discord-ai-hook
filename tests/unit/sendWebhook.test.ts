import { describe, it, expect, vi } from "vitest";
import { sendWebhook } from "../../src/discord/sendWebhook.js";

describe("sendWebhook", () => {
  it("does not fetch when dryRun", async () => {
    const fetchImpl = vi.fn();
    const result = await sendWebhook({
      webhookUrl: "https://discord.com/api/webhooks/x/y",
      content: "test",
      dryRun: true,
      fetchImpl,
    });
    expect(result).toEqual({ sent: false, dryRun: true });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("posts to webhook on success", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 204 });
    const result = await sendWebhook({
      webhookUrl: "https://discord.com/api/webhooks/x/y",
      content: "hello",
      dryRun: false,
      fetchImpl,
    });
    expect(result.sent).toBe(true);
    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it("retries once on failure", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 500, text: async () => "err" })
      .mockResolvedValueOnce({ ok: true, status: 204 });

    await sendWebhook({
      webhookUrl: "https://discord.com/api/webhooks/x/y",
      content: "hello",
      dryRun: false,
      fetchImpl,
    });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});
