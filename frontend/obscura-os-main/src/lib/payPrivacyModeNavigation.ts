import type { PayPrivacyMode } from "@/contexts/PaymentModeContext";



export type PayMainTab = "home" | "pay" | "getpaid" | "automations" | "activity";

export type PaySubSend = "send" | "convert" | "bridge";

export type PaySubGetPaid = "inbox" | "setup" | "request" | "inbound";

export type PaySubAuto = "streams" | "escrows" | "subscriptions" | "payroll";



export type PayRouteSnapshot = {

  tab: PayMainTab;

  paySub: PaySubSend;

  getPaidSub: PaySubGetPaid;

  autoSub: PaySubAuto;

};



export type PayRouteTarget = {

  tab: PayMainTab;

  sub: string | null;

  /** Leave Pay and open global settings (wallet / passkey). */

  openGlobalSettingsWallet?: boolean;

};



/** Tabs that only render private FHE flows in Public Mode (gate / empty states). */

const PUBLIC_REDIRECT_FROM_TABS: PayMainTab[] = ["automations"];



/** Pay sub-routes that require Private Mode. */

const PRIVATE_ONLY_PAY_SUBS: PaySubSend[] = ["convert"];



export function isPayRouteValidForMode(mode: PayPrivacyMode, route: PayRouteSnapshot): boolean {

  if (mode === "public") {

    if (PUBLIC_REDIRECT_FROM_TABS.includes(route.tab)) return false;

    if (route.tab === "pay" && PRIVATE_ONLY_PAY_SUBS.includes(route.paySub)) return false;

  }

  return true;

}



/**

 * Resolve tab + sub after a privacy mode switch.

 * Keeps the user on a valid Pay surface for the selected mode.

 */

export function resolvePayRouteForPrivacyMode(

  mode: PayPrivacyMode,

  route: PayRouteSnapshot,

  options?: { isSmartAvailable?: boolean },

): PayRouteTarget {

  const smartReady = options?.isSmartAvailable ?? false;



  if (mode === "public") {

    if (route.tab === "automations") {

      return { tab: "pay", sub: "send" };

    }

    if (route.tab === "pay" && route.paySub === "convert") {

      return { tab: "pay", sub: "send" };

    }



    const subForTab =

      route.tab === "pay"

        ? route.paySub === "convert"

          ? "send"

          : route.paySub

        : route.tab === "getpaid"

          ? route.getPaidSub

          : route.tab === "automations"

            ? route.autoSub

            : null;



    if (!smartReady) {

      return {

        tab: route.tab,

        sub: subForTab,

        openGlobalSettingsWallet: true,

      };

    }



    return {

      tab: route.tab,

      sub:

        route.tab === "pay"

          ? route.paySub

          : route.tab === "getpaid"

            ? route.getPaidSub

            : route.tab === "automations"

              ? route.autoSub

              : null,

    };

  }



  return {

    tab: route.tab,

    sub:

      route.tab === "pay"

        ? route.paySub

        : route.tab === "getpaid"

          ? route.getPaidSub

          : route.tab === "automations"

            ? route.autoSub

            : null,

  };

}

