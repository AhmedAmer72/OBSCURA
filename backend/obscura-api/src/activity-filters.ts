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
  "CreditMarket.Supplied",
  "CreditMarket.Withdrew",
  "CreditMarket.Withdrawn",
  "CreditMarket.CollateralSupplied",
  "CreditMarket.CollateralWithdrawn",
  "CreditMarket.Borrowed",
  "CreditMarket.Repaid",
  "CreditMarket.LiquidationOpened",
  "CreditMarket.Liquidated",
  "CreditMarket2.Supplied",
  "CreditMarket2.Withdrew",
  "CreditMarket2.Withdrawn",
  "CreditMarket2.CollateralSupplied",
  "CreditMarket2.CollateralWithdrawn",
  "CreditMarket2.Borrowed",
  "CreditMarket2.Repaid",
  "CreditMarket2.LiquidationOpened",
  "CreditMarket2.Liquidated",
  "CreditMarket3.Supplied",
  "CreditMarket3.Withdrew",
  "CreditMarket3.Withdrawn",
  "CreditMarket3.CollateralSupplied",
  "CreditMarket3.CollateralWithdrawn",
  "CreditMarket3.Borrowed",
  "CreditMarket3.Repaid",
  "CreditMarket3.LiquidationOpened",
  "CreditMarket3.Liquidated",
  "CreditMarket4.Supplied",
  "CreditMarket4.Withdrew",
  "CreditMarket4.Withdrawn",
  "CreditMarket4.CollateralSupplied",
  "CreditMarket4.CollateralWithdrawn",
  "CreditMarket4.Borrowed",
  "CreditMarket4.Repaid",
  "CreditMarket4.LiquidationOpened",
  "CreditMarket4.Liquidated",
  "CreditMarket5.Supplied",
  "CreditMarket5.Withdrew",
  "CreditMarket5.Withdrawn",
  "CreditMarket5.CollateralSupplied",
  "CreditMarket5.CollateralWithdrawn",
  "CreditMarket5.Borrowed",
  "CreditMarket5.Repaid",
  "CreditMarket5.LiquidationOpened",
  "CreditMarket5.Liquidated",
  "ObscuraCreditMarket.Supplied",
  "ObscuraCreditMarket.Withdrew",
  "ObscuraCreditMarket.Withdrawn",
  "ObscuraCreditMarket.Borrowed",
  "ObscuraCreditMarket.Repaid",
  "ObscuraCreditMarket.Liquidated",
  "ObscuraCreditMarket.LiquidationOpened",
  "ObscuraCreditMarket.CollateralSupplied",
  "ObscuraCreditMarket.CollateralWithdrawn",
  "CreditVault.Deposited",
  "CreditVault.Withdrew",
  "CreditVault2.Deposited",
  "CreditVault2.Withdrew",
  "ObscuraCreditVault.Deposited",
  "ObscuraCreditVault.Withdrew",
  "CreditAuction.AuctionOpened",
  "CreditAuction.AuctionCreated",
  "CreditAuction.BidSubmitted",
  "CreditAuction.BidPlaced",
  "CreditAuction.AuctionSettled",
  "ObscuraCreditAuction.AuctionCreated",
  "ObscuraCreditAuction.AuctionOpened",
  "ObscuraCreditAuction.BidPlaced",
  "ObscuraCreditAuction.BidSubmitted",
  "ObscuraCreditAuction.AuctionSettled",
  "CreditScore.ScoreUpdated",
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
