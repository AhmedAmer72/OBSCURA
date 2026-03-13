import type { PayPrivacyMode } from "@/contexts/PaymentModeContext";

export type SettingsSection =
  | "notifications"
  | "privacy"
  | "wallet"
  | "contacts"
  | "data"
  | "legacy";

export const PUBLIC_SETTINGS_SECTIONS: SettingsSection[] = [
  "wallet",
  "notifications",
  "data",
];

const ALL_SECTIONS: SettingsSection[] = [
  "notifications",
  "privacy",
  "wallet",
  "contacts",
  "data",
  "legacy",
];

/** Legacy Pay settings `sub` query values → global settings sections. */
export function mapPaySettingsSubToSection(sub: string | null | undefined): SettingsSection {
  switch (sub) {
    case "prefs":
    case "privacy":
      return "privacy";
    case "account":
      return "wallet";
    case "notifications":
      return "notifications";
    case "contacts":
      return "contacts";
    case "data":
      return "data";
    case "legacy":
      return "legacy";
    default:
      return "notifications";
  }
}

export function parseSettingsSectionParam(
  section: string | null | undefined,
  legacySub: string | null | undefined,
): SettingsSection | null {
  if (section && ALL_SECTIONS.includes(section as SettingsSection)) {
    return section as SettingsSection;
  }
  if (legacySub) return mapPaySettingsSubToSection(legacySub);
  return null;
}

export function normalizeSettingsSectionForMode(
  section: SettingsSection,
  mode: PayPrivacyMode,
): SettingsSection {
  if (mode === "public" && !PUBLIC_SETTINGS_SECTIONS.includes(section)) {
    return "wallet";
  }
  return section;
}

export const SETTINGS_RETURN_KEY = "obscura:settingsReturnPath";
