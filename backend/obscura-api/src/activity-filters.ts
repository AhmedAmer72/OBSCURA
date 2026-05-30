/** Mirrors packages/sdk/src/config/activity-filters.ts — keep in sync. */

export type ActivityEventType =
  | "all"
  | "sent"
  | "received"
  | "stream"
  | "invoice"
  | "escrow"
  | "stealth"
  | "credit"
  | "vote";

const CREDIT_ACTIVITY_EVENT_NAMES = [
  "ObscuraCreditMarket.Supplied",
  "ObscuraCreditMarket.Withdrawn",
  "ObscuraCreditMarket.Borrowed",
  "ObscuraCreditMarket.Repaid",
  "ObscuraCreditMarket.Liquidated",
  "ObscuraCreditMarket.CollateralSupplied",
  "ObscuraCreditMarket.CollateralWithdrawn",
  "ObscuraCreditVault.Deposited",
  "ObscuraCreditVault.Withdrew",
  "ObscuraCreditAuction.AuctionCreated",
  "ObscuraCreditAuction.BidPlaced",
  "ObscuraCreditAuction.AuctionSettled",
  "ObscuraCreditScoreV2.ScoreUpdated",
];

const VOTE_ACTIVITY_EVENT_NAMES = [
  "ObscuraVote.ProposalCreated",
  "ObscuraVote.VoteCast",
  "ObscuraVote.VoteChanged",
  "ObscuraVote.Delegated",
  "ObscuraVote.DelegationRemoved",
  "ObscuraVote.ProposalFinalized",
  "ObscuraTreasury.SpendAttached",
  "ObscuraTreasury.SpendExecuted",
  "ObscuraRewards.RewardAccrued",
  "ObscuraRewards.RewardWithdrawn",
];

export const ACTIVITY_EVENT_FILTERS: Record<ActivityEventType, readonly string[]> = {
  all: [],
  sent: ["ObscuraPay.PaymentSent"],
  received: ["ObscuraPay.PaymentReceived"],
  stream: [
    "ObscuraPayStreamV2.StreamCreated",
    "ObscuraPayStreamV2.StreamCancelled",
    "ObscuraPayStreamV2.StreamWithdrawn",
    "ObscuraPayStreamV3.StreamCreated",
    "ObscuraPayStreamV3.StreamCancelled",
    "ObscuraPayStreamV3.CycleSettled",
  ],
  invoice: ["ObscuraInvoice.InvoiceCreated", "ObscuraInvoice.InvoicePaid"],
  escrow: [
    "ObscuraConfidentialEscrow.EscrowCreated",
    "ObscuraConfidentialEscrow.EscrowFunded",
    "ObscuraConfidentialEscrow.EscrowRedeemed",
    "ObscuraConfidentialEscrow.EscrowCancelled",
    "ObscuraConfidentialEscrow.EscrowRefunded",
  ],
  stealth: ["ObscuraStealthRegistry.Announcement", "ObscuraStealthRegistry.MetaAddressSet"],
  credit: CREDIT_ACTIVITY_EVENT_NAMES,
  vote: VOTE_ACTIVITY_EVENT_NAMES,
};

export function isActivityFilter(value: string): value is ActivityEventType {
  return value in ACTIVITY_EVENT_FILTERS;
}
