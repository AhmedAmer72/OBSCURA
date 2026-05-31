export const MOBILE_FRAME_ASPECT = 9 / 19.5;

export type MobileAppScreenshot = {
  src: string;
  alt: string;
  label: "Splash" | "Pay" | "Vote" | "Credit";
};

export const MOBILE_APP_SCREENSHOTS: MobileAppScreenshot[] = [
  {
    src: "/images/mobile-app-splash.png",
    alt: "Obscura mobile splash screen — private money, computed in the open",
    label: "Splash",
  },
  {
    src: "/images/mobile-app-pay.png",
    alt: "Obscura Pay — private balance, send, receive, and automate on mobile",
    label: "Pay",
  },
  {
    src: "/images/mobile-app-govern.png",
    alt: "Obscura Vote — private ballots, proposals, and treasury",
    label: "Vote",
  },
  {
    src: "/images/mobile-app-credit.png",
    alt: "Obscura Credit — private lending with encrypted collateral and debt",
    label: "Credit",
  },
];

export const MOBILE_APP_FOREST_SECTION =
  "relative overflow-hidden border-y border-white/10 bg-forest text-white";

export const MOBILE_APP_FOREST_GRADIENT = {
  background:
    "radial-gradient(80% 50% at 20% 50%, rgba(178,235,118,0.12), transparent 55%), radial-gradient(60% 40% at 90% 20%, rgba(255,255,255,0.06), transparent 50%)",
};
