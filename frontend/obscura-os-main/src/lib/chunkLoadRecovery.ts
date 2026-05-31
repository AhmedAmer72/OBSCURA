const RELOAD_KEY = "obscura:chunk-reload-once";

/** Detect Vite/Rollup lazy-chunk failures after deploy or stale cache. */
export function isChunkLoadError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error ?? "");
  return /Failed to fetch dynamically imported module|Loading chunk \d+ failed|Importing a module script failed|error loading dynamically imported module|ChunkLoadError/i.test(
    msg,
  );
}

/** User-facing copy for FHE init / reveal failures caused by missing JS chunks. */
export function formatFheLoadError(error: unknown): string {
  if (isChunkLoadError(error)) {
    return "Encryption library failed to load — the app may have updated. Refresh the page, then tap Reveal again.";
  }
  return error instanceof Error ? error.message : "Decrypt failed";
}

/** Auto-reload once when Vite preloads a stale hashed chunk after deployment. */
export function registerChunkLoadRecovery(): void {
  if (typeof window === "undefined") return;

  window.addEventListener("vite:preloadError", (event) => {
    event.preventDefault();
    if (!sessionStorage.getItem(RELOAD_KEY)) {
      sessionStorage.setItem(RELOAD_KEY, "1");
      window.location.reload();
    }
  });

  window.addEventListener("load", () => {
    sessionStorage.removeItem(RELOAD_KEY);
  });
}
