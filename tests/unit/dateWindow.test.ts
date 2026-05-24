import { describe, it, expect } from "vitest";
import {
  calendarDaysBetween,
  isArticleWithinLookback,
  partitionByLookbackWindow,
} from "../../src/filters/dateWindow.js";
import type { Article } from "../../src/types.js";

const article = (publishedAt: string | null): Article => ({
  url: "https://example.com/a",
  title: "Agent release",
  source: "openai",
  publishedAt,
  category: null,
});

describe("dateWindow", () => {
  const now = new Date("2026-05-24T12:00:00.000Z");
  const tz = "Asia/Taipei";

  it("calendarDaysBetween counts inclusive calendar days", () => {
    expect(calendarDaysBetween("2026-05-24", "2026-05-24")).toBe(0);
    expect(calendarDaysBetween("2026-05-24", "2026-05-23")).toBe(1);
    expect(calendarDaysBetween("2026-05-24", "2026-05-17")).toBe(7);
  });

  it("lookback 1 allows only yesterday in TZ (not today)", () => {
    expect(
      isArticleWithinLookback(
        article("2026-05-24T01:00:00.000Z"),
        1,
        tz,
        now,
      ),
    ).toBe(false);
    expect(
      isArticleWithinLookback(
        article("2026-05-23T15:00:00.000Z"),
        1,
        tz,
        now,
      ),
    ).toBe(true);
  });

  it("lookback 7 allows seven days before today (excludes today)", () => {
    expect(
      isArticleWithinLookback(
        article("2026-05-24T08:00:00.000Z"),
        7,
        tz,
        now,
      ),
    ).toBe(false);
    expect(
      isArticleWithinLookback(
        article("2026-05-17T00:00:00.000Z"),
        7,
        tz,
        now,
      ),
    ).toBe(true);
    expect(
      isArticleWithinLookback(
        article("2026-05-16T00:00:00.000Z"),
        7,
        tz,
        now,
      ),
    ).toBe(false);
  });

  it("lookback 0 disables date filter", () => {
    expect(
      isArticleWithinLookback(
        article("2020-01-01T00:00:00.000Z"),
        0,
        tz,
        now,
      ),
    ).toBe(true);
  });

  it("missing publishedAt passes (engineering lists)", () => {
    expect(isArticleWithinLookback(article(null), 1, tz, now)).toBe(true);
  });

  it("partitionByLookbackWindow splits articles", () => {
    const { inWindow, outOfWindow } = partitionByLookbackWindow(
      [
        article("2026-05-24T08:00:00.000Z"),
        article("2026-05-23T08:00:00.000Z"),
      ],
      1,
      tz,
      now,
    );
    expect(inWindow).toHaveLength(1);
    expect(outOfWindow).toHaveLength(1);
    expect(outOfWindow[0]?.reason).toBe("date:outside_lookback_1d");
  });
});
