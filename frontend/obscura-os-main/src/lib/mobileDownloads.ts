export type MobileRelease = {
  version: string;
  publishedAt: string;
  label: string;
  fileName: string;
  downloadPath: string;
  sizeBytes: number | null;
  sha256: string | null;
  minAndroid?: string;
  recommended?: boolean;
  notes?: string[];
};

export type MobileReleasesManifest = {
  channel: string;
  productName: string;
  latestVersion: string;
  releases: MobileRelease[];
  installSteps?: string[];
};

export const MOBILE_RELEASES_URL = "/downloads/mobile-releases.json";

export async function fetchMobileReleases(): Promise<MobileReleasesManifest> {
  const res = await fetch(MOBILE_RELEASES_URL, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Could not load mobile release list.");
  }
  return res.json() as Promise<MobileReleasesManifest>;
}

export function getLatestRelease(manifest: MobileReleasesManifest): MobileRelease | undefined {
  const recommended = manifest.releases.find((r) => r.recommended);
  if (recommended) return recommended;
  return manifest.releases[0];
}

export function formatBytes(bytes: number | null | undefined): string | null {
  if (bytes == null || !Number.isFinite(bytes) || bytes <= 0) return null;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
