import type { DocPage } from "../types";

export const mobilePage: DocPage = {
  slug: "mobile",
  title: "Obscura Mobile",
  description:
    "Android client (Capacitor) for Pay, Vote, and Credit — same FHE privacy model as Harmony web, direct APK sideload.",
  category: "Platform",
  keywords: ["android", "apk", "capacitor", "mobile", "download", "walletconnect", "fhe"],
  blocks: [
    {
      type: "callout",
      variant: "success",
      title: "Live · v0.1.0 · Arbitrum Sepolia testnet",
      text: "Obscura Mobile ships as a signed Android APK. Download from the web app, sideload on device, connect with WalletConnect, and use the same encrypted Pay, Vote, and Credit workspaces as desktop Harmony.",
    },
    {
      type: "link-grid",
      items: [
        {
          label: "Download APK",
          href: "/download",
          description: "Direct install · SHA-256 verified manifest · Android 8.0+",
        },
        {
          label: "Open Harmony web",
          href: "/home",
          description: "Desktop command center · docs · developer portal",
        },
        {
          label: "Mobile architecture (canonical)",
          href: "https://github.com/mohamedwael201193/OBSCURA/blob/main/OBSCURA_MOBILE_APP_ARCHITECTURE_v1.md",
          description: "Full Capacitor shell, sync model, FHE on WebView, release checklist",
        },
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "What ships in the APK",
      id: "scope",
    },
    {
      type: "table",
      headers: ["Module", "Route", "Core capability"],
      rows: [
        ["Pay", "/pay", "Shield USDC → ocUSDC, stealth inbox, streams, escrows, public passkey USDC"],
        ["Vote", "/vote", "FHE-encrypted ballots, delegation, treasury, rewards, advanced governor"],
        ["Credit", "/credit", "Encrypted lending on canonical ocUSDC_Pay market"],
      ],
    },
    {
      type: "paragraph",
      text: "Mobile is not the marketing site. Landing, ecosystem storytelling, and this developer portal stay on the web deployment. The APK opens directly into Pay and uses a bottom-tab shell (Pay · Vote · Credit) with sticky section chips per product.",
    },
    {
      type: "heading",
      level: 2,
      text: "Mobile vs web",
      id: "boundary",
    },
    {
      type: "table",
      headers: ["Surface", "Harmony web", "Obscura Mobile"],
      rows: [
        ["Marketing / docs", "✅", "❌ Not bundled"],
        ["Pay · Vote · Credit workspaces", "✅ Sidebar shell", "✅ Bottom tabs + sub-nav"],
        ["WalletConnect", "Header chip", "Native-first bottom sheet"],
        ["CoFHE encryption", "@fhenixprotocol/cofhe-sdk", "Same SDK in Capacitor WebView"],
        ["Service worker push", "✅ Browser", "❌ Disabled on native (v1)"],
        ["Contract addresses", "VITE_* env", "Same env + boot validation gate"],
      ],
    },
    {
      type: "diagram",
      title: "Shared protocol tier",
      mermaid: `flowchart TB
  subgraph WEB[Web · obscuraos.online]
    DOCS[/docs developer portal]
    DL[/download APK manifest]
  end

  subgraph MOBILE[Mobile · Capacitor APK]
    TABS[Pay · Vote · Credit tabs]
    WV[WebView + cofhe-sdk]
  end

  subgraph SHARED[Shared tier]
    CHAIN[Arbitrum Sepolia contracts]
    API[obscura-api]
    WK[obscura-worker]
    SB[(Supabase)]
  end

  DL -->|sideload| MOBILE
  WEB --> SHARED
  MOBILE --> SHARED
  WV --> CHAIN`,
    },
    {
      type: "heading",
      level: 2,
      text: "FHE & privacy on mobile",
      id: "fhe",
    },
    {
      type: "list",
      items: [
        "Identical reveal-on-demand policy: no decryptForView on mount; balances and positions stay masked until the user taps Reveal.",
        "Vote choices encrypted client-side; tallies hidden until explicit Decrypt Public Tally.",
        "Private Mode uses EOA + WalletConnect; Public Mode uses passkey smart account for visible USDC only (no FHE writes via AA).",
        "FHE proof generation runs in the WebView — expect longer encrypt steps on mid-range Android hardware.",
      ],
    },
    {
      type: "callout",
      variant: "warning",
      title: "Testnet only",
      text: "Obscura Mobile targets Arbitrum Sepolia (chainId 421614) with Fhenix CoFHE testnet coprocessing. Residual public metadata (addresses, tx hashes, proposal titles) still applies — see Privacy model docs.",
    },
    {
      type: "heading",
      level: 2,
      text: "Install from direct download",
      id: "install",
    },
    {
      type: "steps",
      items: [
        {
          title: "Download the APK",
          description: "Open obscuraos.online/download on your Android phone (Chrome or file manager).",
          href: "/download",
        },
        {
          title: "Allow sideload",
          description: "When prompted, allow installs from your browser or Files app for this source only.",
        },
        {
          title: "Launch & connect",
          description: "Open Obscura, connect wallet via WalletConnect, switch to Arbitrum Sepolia.",
        },
        {
          title: "Verify release",
          description: "Compare SHA-256 in mobile-releases.json with the downloaded file before installing.",
        },
      ],
    },
    {
      type: "code",
      language: "json",
      title: "Release manifest (web-hosted)",
      code: `GET /downloads/mobile-releases.json

{
  "latestVersion": "0.1.0",
  "releases": [{
    "downloadPath": "/downloads/obscura-mobile-0.1.0.apk",
    "sha256": "<verify before install>",
    "minAndroid": "8.0"
  }]
}`,
    },
    {
      type: "heading",
      level: 2,
      text: "SDK & MCP (not in the APK)",
      id: "integrators",
    },
    {
      type: "paragraph",
      text: "The mobile app is a protocol consumer — not an alternative SDK surface. Automation, agents, and external integrators should use @obscura-fhe/sdk and MCP servers documented in this portal.",
    },
    {
      type: "cards",
      items: [
        {
          title: "SDK reference",
          description: "Six modules · viem builders · FheProvider for encrypted writes",
          href: "/docs/sdk",
        },
        {
          title: "MCP servers",
          description: "User, Dev, and Docs profiles for Cursor and Claude agents",
          href: "/docs/mcp",
        },
        {
          title: "Privacy model",
          description: "Encrypted vs public vs reveal boundaries",
          href: "/docs/privacy",
        },
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "Build & sync (engineers)",
      id: "engineering",
    },
    {
      type: "list",
      items: [
        "Source of truth: frontend/obscura-os-main in the monorepo; Capacitor fork syncs via scripts/sync-from-obscura-web.ps1.",
        "Package ID: finance.obscura.mobile · Capacitor 8 · Vite dist → android/.",
        "Boot gate validates required VITE_* contract addresses before rendering product pages.",
        "Post-sync QA: Pay shield, vote cast, credit borrow, Android back navigation, keyboard resize.",
      ],
    },
  ],
};
