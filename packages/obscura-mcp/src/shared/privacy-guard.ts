import type { ContractCall, InEuint64 } from "@obscura-fhe/sdk";

export const BANNED_TOOL_PATTERNS = [
  /^decrypt_/i,
  /decrypt/i,
  /relay_userop/i,
  /get_logs/i,
  /service_role/i,
  /keeper_/i,
];

export const EOA_FHE_WARNING =
  "EOA only — CoFHE InEuint64 proofs bind to the immediate caller. " +
  "Smart accounts cannot forward encrypted writes (InvalidSigner).";

export const ENCRYPTED_HANDLE_DISPLAY =
  "Display as *** until the user explicitly reveals in the Obscura app. " +
  "This is an encrypted handle (ctHash), not a plaintext balance.";

export const MAX_ACTIVITY_PAGE_SIZE = 25;

export function assertNoBannedTool(name: string): void {
  for (const pattern of BANNED_TOOL_PATTERNS) {
    if (pattern.test(name)) {
      throw new Error(`Privacy guard: banned tool name "${name}"`);
    }
  }
}

export function bigintToHandleHex(value: bigint): `0x${string}` {
  return `0x${value.toString(16).padStart(64, "0")}` as `0x${string}`;
}

export function serializeContractCall(call: ContractCall) {
  return {
    ...call,
    chainId: call.chainId,
    address: call.address,
    functionName: call.functionName,
    args: call.args,
    eoaFheWarning: EOA_FHE_WARNING,
  };
}

export function parseInEuint64(input: {
  ctHash: string;
  securityZone: number;
  utype: number;
  signature: string;
}): InEuint64 {
  const ct = input.ctHash.startsWith("0x") ? BigInt(input.ctHash) : BigInt(input.ctHash);
  if (!input.signature.startsWith("0x")) {
    throw new Error("signature must be hex (0x...)");
  }
  return {
    ctHash: ct,
    securityZone: input.securityZone,
    utype: input.utype,
    signature: input.signature as `0x${string}`,
  };
}

export function jsonText(data: unknown): { content: Array<{ type: "text"; text: string }> } {
  return {
    content: [{ type: "text", text: JSON.stringify(data, replacer, 2) }],
  };
}

function replacer(_key: string, value: unknown): unknown {
  if (typeof value === "bigint") return value.toString();
  return value;
}
