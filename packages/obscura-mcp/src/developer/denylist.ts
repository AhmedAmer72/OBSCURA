import path from "node:path";

const DENY_PATTERNS = [
  /\.env$/i,
  /\.env\./i,
  /node_modules/i,
  /\.git/i,
  /SERVICE_ROLE/i,
  /PRIVATE_KEY/i,
  /VAPID_PRIVATE/i,
  /BUNDLER_URL/i,
];

const SECRET_CONTENT_PATTERNS = [
  /SUPABASE_SERVICE_ROLE_KEY\s*=/,
  /VAPID_PRIVATE_KEY\s*=/,
  /KEEPER_PRIVATE_KEY\s*=/,
  /BUNDLER_URL\s*=\s*https?:\/\//,
];

export function resolveRepoRoot(): string {
  return process.env.OBSCURA_REPO_ROOT ?? process.cwd();
}

export function isPathDenied(relativePath: string): boolean {
  const normalized = relativePath.replace(/\\/g, "/");
  return DENY_PATTERNS.some((p) => p.test(normalized));
}

export function containsSecretContent(content: string): boolean {
  return SECRET_CONTENT_PATTERNS.some((p) => p.test(content));
}

export function safeJoinRepo(repoRoot: string, relativePath: string): string {
  const resolved = path.resolve(repoRoot, relativePath);
  const root = path.resolve(repoRoot);
  if (!resolved.startsWith(root)) {
    throw new Error("Path escapes repository root");
  }
  return resolved;
}
