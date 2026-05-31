import { describe, expect, it } from "vitest";
import {
  isPayRouteValidForMode,
  resolvePayRouteForPrivacyMode,
} from "@/lib/payPrivacyModeNavigation";

const baseRoute = {
  tab: "home" as const,
  paySub: "send" as const,
  getPaidSub: "inbox" as const,
  autoSub: "streams" as const,
};

describe("payPrivacyModeNavigation", () => {
  it("redirects automations to public send", () => {
    const target = resolvePayRouteForPrivacyMode(
      "public",
      { ...baseRoute, tab: "automations" },
      { isSmartAvailable: true },
    );
    expect(target).toEqual({ tab: "pay", sub: "send" });
  });

  it("redirects private-only convert to send in public mode", () => {
    const target = resolvePayRouteForPrivacyMode(
      "public",
      { ...baseRoute, tab: "pay", paySub: "convert" },
      { isSmartAvailable: true },
    );
    expect(target).toEqual({ tab: "pay", sub: "send" });
  });

  it("opens smart account setup when switching to public without passkey", () => {
    const target = resolvePayRouteForPrivacyMode(
      "public",
      { ...baseRoute, tab: "home" },
      { isSmartAvailable: false },
    );
    expect(target.tab).toBe("home");
    expect(target.openGlobalSettingsWallet).toBe(true);
  });

  it("marks invalid public routes", () => {
    expect(
      isPayRouteValidForMode("public", { ...baseRoute, tab: "automations" }),
    ).toBe(false);
    expect(
      isPayRouteValidForMode("public", { ...baseRoute, tab: "pay", paySub: "convert" }),
    ).toBe(false);
  });
});
