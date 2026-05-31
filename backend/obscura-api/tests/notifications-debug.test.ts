import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const notificationsSrc = readFileSync(
  join(__dirname, "../src/notifications.ts"),
  "utf8",
);

describe("notifications debug push security", () => {
  it("registers /debug/push-test only when not production", () => {
    expect(notificationsSrc).toContain("DEBUG_PUSH_ENABLED");
    expect(notificationsSrc).toContain('process.env.NODE_ENV !== "production"');
    expect(notificationsSrc).toContain("if (DEBUG_PUSH_ENABLED)");
    expect(notificationsSrc).toContain('"/debug/push-test"');
  });
});
