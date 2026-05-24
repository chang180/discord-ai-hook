/** Discord MessageFlags.SUPPRESS_EMBEDS — 不顯示連結預覽卡片 */
export const SUPPRESS_EMBEDS_FLAG = 1 << 2;

export interface SendWebhookOptions {
  webhookUrl: string;
  content: string;
  dryRun: boolean;
  fetchImpl?: typeof fetch;
  /** 預設 true：避免多則訊息因 embed 視覺上黏在一起 */
  suppressEmbeds?: boolean;
}

export async function sendWebhook(
  options: SendWebhookOptions,
): Promise<{ sent: boolean; dryRun: boolean }> {
  const {
    webhookUrl,
    content,
    dryRun,
    fetchImpl = fetch,
    suppressEmbeds = true,
  } = options;

  if (dryRun) {
    return { sent: false, dryRun: true };
  }

  if (!webhookUrl) {
    throw new Error("DISCORD_WEBHOOK_URL is not configured");
  }

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetchImpl(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          ...(suppressEmbeds ? { flags: SUPPRESS_EMBEDS_FLAG } : {}),
        }),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`Discord webhook failed: ${res.status} ${body}`);
      }
      return { sent: true, dryRun: false };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }
  }
  throw lastError ?? new Error("Discord webhook failed");
}

export async function sendTestWebhook(
  webhookUrl: string,
  dryRun: boolean,
  fetchImpl?: typeof fetch,
): Promise<void> {
  const content =
    "【Discord AI Labs Watcher】\n\n連線測試 — 若看到此訊息，webhook 設定正確。";
  await sendWebhook({ webhookUrl, content, dryRun, fetchImpl });
}
