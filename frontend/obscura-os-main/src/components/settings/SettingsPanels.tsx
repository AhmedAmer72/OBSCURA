import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  BookUser,
  Check,
  KeyRound,
  Loader2,
  Lock,
  Pencil,
  Plus,
  RefreshCw,
  RotateCw,
  Settings as SettingsIcon,
  Trash2,
  Wrench,
  X,
} from "lucide-react";
import { HarmonyFormCard, HarmonySelect } from "@/components/harmony/harmony-ui";
import { PayHarmonyNotice } from "@/components/harmony/PayHarmonyTabShell";
import { PasskeyEnrollModal } from "@/components/harmony/PasskeyEnrollModal";
import { PaymentModeBar } from "@/components/harmony/PaymentModeBar";
import AddContactModal from "@/components/pay-v4/AddContactModal";
import OcUSDCTransferForm from "@/components/pay-v4/OcUSDCTransferForm";
import CreateStreamForm from "@/components/pay-v4/CreateStreamForm";
import StealthInbox from "@/components/pay-v4/StealthInbox";
import { Input } from "@/components/ui/input";
import { usePreferences, type GasMode, type SendMode, type UIMode } from "@/contexts/PreferencesContext";
import { usePaymentMode } from "@/contexts/PaymentModeContext";
import { useStealthRotation } from "@/hooks/useStealthRotation";
import { useStealthInbox } from "@/hooks/useStealthInbox";
import { useReceipts } from "@/hooks/useReceipts";
import { useAddressBook } from "@/hooks/useAddressBook";
import { useNotificationPrefs } from "@/hooks/useNotificationPrefs";
import { useSmartAccount } from "@/hooks/useSmartAccount";

function PrivateModeGate({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const { privacyMode, setPrivacyMode } = usePaymentMode();
  if (privacyMode === "private") return <>{children}</>;

  return (
    <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-4">
      <div className="space-y-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-amber-900/55">Private Mode</div>
          <h3 className="mt-1 text-base font-medium text-foreground">{title}</h3>
        </div>
        <p className="text-[13px] text-muted-foreground leading-relaxed">{description}</p>
        <button type="button" onClick={() => setPrivacyMode("private")} className="btn-pay btn-pay-primary">
          <Lock className="w-3.5 h-3.5" /> Switch to Private Mode
        </button>
      </div>
    </div>
  );
}

export function SettingsPayDefaultsCard() {
  const prefs = usePreferences();
  return (
    <>
      <HarmonyFormCard title="Interface & send defaults" eyebrow="Pay">
        <div className="space-y-4">
          <div className="grid grid-cols-[1fr_auto] gap-y-4 items-center">
            <label className="text-[12px] text-foreground/80">UI mode</label>
            <HarmonySelect value={prefs.uiMode} onChange={(v) => prefs.setPreference("uiMode", v as UIMode)}>
              <option value="beginner">Beginner</option>
              <option value="advanced">Advanced</option>
            </HarmonySelect>

            <label className="text-[12px] text-foreground/80">Default send mode</label>
            <HarmonySelect
              value={prefs.defaultSendMode}
              onChange={(v) => prefs.setPreference("defaultSendMode", v as SendMode)}
            >
              <option value="direct">Direct</option>
              <option value="stealth">Stealth</option>
              <option value="cross-chain">Cross-chain</option>
            </HarmonySelect>

            <label className="text-[12px] text-foreground/80">Gas mode</label>
            <HarmonySelect value={prefs.gasMode} onChange={(v) => prefs.setPreference("gasMode", v as GasMode)}>
              <option value="fast">Fast</option>
              <option value="standard">Standard</option>
              <option value="eco">Eco</option>
            </HarmonySelect>
          </div>
        </div>
      </HarmonyFormCard>

      <HarmonyFormCard title="Onboarding" eyebrow="Wizard">
        <button
          type="button"
          onClick={() => prefs.setPreference("hasCompletedOnboarding", false)}
          className="btn-pay btn-pay-ghost"
        >
          <SettingsIcon className="w-3.5 h-3.5" />
          Replay onboarding wizard
        </button>
      </HarmonyFormCard>
    </>
  );
}

export function SettingsPrivacyCard() {
  const prefs = usePreferences();
  const rotation = useStealthRotation();
  const inbox = useStealthInbox();
  return (
    <>
      <SettingsPayDefaultsCard />
      <HarmonyFormCard title="Stealth privacy" eyebrow="Meta-address">
        <div className="space-y-4">
          <div className="grid grid-cols-[1fr_auto] gap-y-3 items-center">
            <label className="text-[12px] text-foreground/80 pr-4">Auto-rotate meta-address every (days, 0 = off)</label>
            <input
              type="number"
              min={0}
              max={365}
              value={prefs.stealthAutoRotateDays}
              onChange={(e) => prefs.setPreference("stealthAutoRotateDays", Number(e.target.value) || 0)}
              className="pay-input w-24 text-center"
            />
          </div>
          <div className="text-[11px] text-muted-foreground/55">
            Current meta index:{" "}
            <span className="text-foreground/80 font-mono">
              {rotation.current ? rotation.current.index.toString() : "—"}
            </span>{" "}
            · history length: {rotation.historyLength.toString()}
          </div>
          <button
            onClick={() => void rotation.rotate()}
            disabled={rotation.isPending}
            className="btn-pay btn-pay-ghost"
          >
            <RotateCw className="w-3.5 h-3.5" />
            {rotation.isPending ? "Rotating…" : "Rotate now"}
          </button>
          {rotation.error && <div className="text-[11px] text-destructive">{rotation.error}</div>}
        </div>
      </HarmonyFormCard>

      <HarmonyFormCard title="Inbox filter" eyebrow="On-chain">
        <div className="space-y-3">
          <p className="text-[12px] text-muted-foreground/60 leading-relaxed">
            The on-chain ignore filter is a per-recipient bloom. Resetting clears it — senders you ignored will
            reappear.
          </p>
          <button onClick={() => void inbox.resetFilter()} className="btn-pay btn-pay-ghost">
            <RotateCw className="w-3.5 h-3.5" />
            Reset ignore filter
          </button>
        </div>
      </HarmonyFormCard>
    </>
  );
}

export function SettingsDataCard() {
  const receipts = useReceipts();
  return (
    <HarmonyFormCard title="Local data" eyebrow="Receipts">
      <div className="space-y-3">
        <p className="text-[12px] text-muted-foreground/60 leading-relaxed">
          Receipts are stored only in this browser. Export before clearing if you want to keep proofs of payment.
        </p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => receipts.exportJSON()} className="btn-pay btn-pay-ghost">
            Export receipts
          </button>
          <button onClick={() => receipts.clear()} className="btn-pay btn-pay-ghost">
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
            <span className="text-red-400">Clear receipts ({receipts.receipts.length})</span>
          </button>
        </div>
      </div>
    </HarmonyFormCard>
  );
}

export function SettingsNotificationsCard() {
  const { prefs, isLoading, pushSupported, permission, serviceWorkerReady, enable, repair, disable, testPush, savePrefs } =
    useNotificationPrefs();
  const [email, setEmail] = useState(prefs?.email ?? "");
  const [saving, setSaving] = useState(false);
  const [pushSaving, setPushSaving] = useState(false);
  const [repairing, setRepairing] = useState(false);
  const [testing, setTesting] = useState(false);
  const [pushError, setPushError] = useState<string | null>(null);
  const [pushResult, setPushResult] = useState<string | null>(null);

  const handleEmailSave = async () => {
    setSaving(true);
    try {
      await savePrefs({ email, email_enabled: !!email });
    } finally {
      setSaving(false);
    }
  };

  const handlePushToggle = async () => {
    setPushSaving(true);
    setPushError(null);
    setPushResult(null);
    try {
      if (prefs?.push_enabled) await disable();
      else await enable();
    } catch (err) {
      setPushError((err as Error).message || "Push notification setup failed");
    } finally {
      setPushSaving(false);
    }
  };

  const handleRepair = async () => {
    setRepairing(true);
    setPushError(null);
    setPushResult(null);
    try {
      await repair();
      setPushResult("This browser is subscribed.");
    } catch (err) {
      setPushError((err as Error).message || "Push notification repair failed");
    } finally {
      setRepairing(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setPushError(null);
    setPushResult(null);
    try {
      const result = await testPush();
      setPushResult(
        result.displayed
          ? `Browser notification displayed. Server push sent ${result.sent}/${result.attempted}.`
          : `Test attempted ${result.attempted}, sent ${result.sent}.`,
      );
    } catch (err) {
      setPushError((err as Error).message || "Push notification test failed");
    } finally {
      setTesting(false);
    }
  };

  return (
    <>
      <HarmonyFormCard title="Push notifications" eyebrow="Browser">
        <div className="space-y-4">
          {!pushSupported && (
            <p className="text-[12px] text-muted-foreground/60">This browser cannot receive push alerts.</p>
          )}
          {pushSupported && (
            <div className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-3">
              <label className="text-[12px] text-foreground/80">Push alerts</label>
              {isLoading || pushSaving ? (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              ) : (
                <button
                  type="button"
                  onClick={handlePushToggle}
                  className={`btn-pay ${prefs?.push_enabled ? "btn-pay-primary" : "btn-pay-ghost"}`}
                >
                  {prefs?.push_enabled ? "Enabled" : "Enable"}
                </button>
              )}
            </div>
          )}
          {pushSupported && (
            <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-[11px] text-muted-foreground/55">
              <span>Browser permission</span>
              <span className="font-mono text-foreground/65">{permission}</span>
              <span>Service worker</span>
              <span className="font-mono text-foreground/65">{serviceWorkerReady ? "ready" : "starting"}</span>
            </div>
          )}
          {prefs?.push_enabled && (
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <button
                type="button"
                disabled={repairing || testing}
                onClick={handleRepair}
                className="btn-pay btn-pay-ghost justify-center"
              >
                {repairing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                Repair browser
              </button>
              <button
                type="button"
                disabled={repairing || testing}
                onClick={handleTest}
                className="btn-pay btn-pay-ghost justify-center"
              >
                {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bell className="w-3.5 h-3.5" />}
                Test
              </button>
            </div>
          )}
          {prefs?.push_enabled && (
            <p className="text-[11px] text-muted-foreground/55">
              Push alerts are enabled for on-chain activity linked to your wallet.
            </p>
          )}
          {pushResult && <p className="text-[11px] text-[#2D6A4F]">{pushResult}</p>}
          {pushError && <p className="text-[11px] text-red-400">{pushError}</p>}
        </div>
      </HarmonyFormCard>

      <HarmonyFormCard title="Email notifications" eyebrow="Optional">
        <div className="space-y-3">
          <p className="text-[12px] text-muted-foreground/60 leading-relaxed">
            Receive email summaries for payments received. Your email is stored server-side and never shared.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pay-input w-full flex-1"
            />
            <button
              type="button"
              disabled={saving || !email}
              onClick={handleEmailSave}
              className="btn-pay btn-pay-ghost justify-center"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Save
            </button>
          </div>
          {prefs?.email_enabled && prefs.email && (
            <p className="text-[11px] text-[#2D6A4F]">
              Email alerts active · {prefs.email}
            </p>
          )}
        </div>
      </HarmonyFormCard>
    </>
  );
}

export function SettingsSmartAccountCard() {
  const { accountAddress, isDeployed, hasPasskey, status, error } = useSmartAccount();
  const [enrollOpen, setEnrollOpen] = useState(false);

  return (
    <>
      <HarmonyFormCard title="Smart account" eyebrow="ERC-4337 · Passkey">
        <div className="space-y-4">
          <p className="text-[12px] text-muted-foreground/60 leading-relaxed">
            Enable a gasless smart account secured by a device passkey (WebAuthn). Supported actions can be signed
            without managing gas fees. Encrypted ocUSDC sends stay in Private Mode.
          </p>

          <div className="grid grid-cols-[1fr_auto] gap-y-3 items-center text-[12px]">
            <span className="text-foreground/80">Account address</span>
            <span className="font-mono text-[11px] text-muted-foreground/60 truncate max-w-[160px]">
              {accountAddress ? `${accountAddress.slice(0, 8)}…${accountAddress.slice(-6)}` : "—"}
            </span>

            <span className="text-foreground/80">Deployed</span>
            <span className={isDeployed ? "text-[#2D6A4F]" : "text-muted-foreground/55"}>
              {isDeployed ? "Yes" : "No"}
            </span>

            <span className="text-foreground/80">Passkey</span>
            <span className={hasPasskey ? "text-[#2D6A4F]" : "text-muted-foreground/55"}>
              {hasPasskey ? "Enrolled" : "Not enrolled"}
            </span>

            <span className="text-foreground/80">Status</span>
            <span className="capitalize text-muted-foreground/60">{status}</span>

            <span className="text-foreground/80">Encrypted ocUSDC sends</span>
            <span className="text-muted-foreground/55">Private Mode</span>
          </div>

          {error && <p className="text-[11px] text-destructive">{error}</p>}

          {!isDeployed && (
            <button type="button" onClick={() => setEnrollOpen(true)} className="btn-pay btn-pay-primary">
              <KeyRound className="w-3.5 h-3.5" />
              Enroll passkey &amp; deploy account
            </button>
          )}

          {isDeployed && !hasPasskey && (
            <button type="button" onClick={() => setEnrollOpen(true)} className="btn-pay btn-pay-ghost">
              <KeyRound className="w-3.5 h-3.5" />
              Add passkey to existing account
            </button>
          )}
        </div>
      </HarmonyFormCard>

      {enrollOpen && <PasskeyEnrollModal onClose={() => setEnrollOpen(false)} />}
    </>
  );
}

export function SettingsWalletSection({ onSetupSmart }: { onSetupSmart?: () => void }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <PaymentModeBar variant="pill" showHelp onSetupSmart={onSetupSmart} />
      </div>
      <SettingsSmartAccountCard />
    </div>
  );
}

export function SettingsContactsSection() {
  const { contacts, isLoading, isPending, error, refresh, removeContact, relabel } = useAddressBook();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftLabel, setDraftLabel] = useState("");

  const startEdit = (id: string, current: string | null) => {
    setEditingId(id);
    setDraftLabel(current ?? "");
  };

  const saveEdit = async (cidStr: string) => {
    if (!draftLabel.trim()) return;
    try {
      await relabel(BigInt(cidStr), draftLabel.trim());
      setEditingId(null);
    } catch {
      /* surfaced in UI */
    }
  };

  return (
    <HarmonyFormCard title="Contacts" eyebrow="Address book">
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={isLoading}
          className="inline-flex h-8 items-center gap-1.5 rounded-full hairline px-3 text-xs hover:bg-muted"
        >
          {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCw className="h-3 w-3" />}
          Refresh
        </button>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-8 items-center gap-1.5 rounded-[var(--dash-radius-btn)] bg-[hsl(var(--dash-forest))] px-3 text-xs font-medium text-[hsl(96_18%_97%)]"
        >
          <Plus className="h-3 w-3" />
          Add contact
        </button>
      </div>
      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {contacts.length === 0 && !isLoading ? (
        <HarmonyFormCard title="No contacts yet" eyebrow="Address book">
          <div className="py-8 text-center">
            <BookUser className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="mx-auto mt-4 max-w-sm text-sm text-muted-foreground">
              Add a contact to send encrypted payments without retyping addresses.
            </p>
            <button type="button" onClick={() => setOpen(true)} className="btn-pay btn-pay-emerald mt-6">
              <Plus className="w-3.5 h-3.5" />
              Add your first contact
            </button>
          </div>
        </HarmonyFormCard>
      ) : (
        <div className="space-y-2">
          {contacts.map((c) => {
            const idStr = c.contactId.toString();
            const isEditing = editingId === idStr;
            return (
              <motion.div
                key={idStr}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 rounded-2xl hairline bg-card p-4"
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted font-mono text-[11px]">
                  {idStr}
                </div>
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <Input
                      value={draftLabel}
                      onChange={(e) => setDraftLabel(e.target.value)}
                      autoFocus
                      className="text-[12px] bg-white/[0.03] border-white/[0.09] focus:border-cyan-500/40"
                    />
                  ) : (
                    <div className="text-[13px] text-foreground truncate">
                      {c.label ?? <span className="text-muted-foreground/40">Contact #{idStr}</span>}
                    </div>
                  )}
                  <div className="text-[10px] text-muted-foreground/35 font-mono truncate mt-0.5">
                    {c.labelHash} · {new Date(Number(c.createdAt) * 1000).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => void saveEdit(idStr)}
                        disabled={isPending}
                        className="p-1.5 hover:bg-white/[0.06] rounded-md text-emerald-400 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        disabled={isPending}
                        className="p-1.5 hover:bg-white/[0.06] rounded-md text-muted-foreground/50 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(idStr, c.label)}
                        disabled={isPending}
                        className="p-1.5 hover:bg-white/[0.06] rounded-md text-muted-foreground/50 hover:text-foreground transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => void removeContact(c.contactId)}
                        disabled={isPending}
                        className="p-1.5 hover:bg-white/[0.06] rounded-md text-muted-foreground/50 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AddContactModal open={open} onClose={() => setOpen(false)} />
    </HarmonyFormCard>
  );
}

export function SettingsLegacyPanel({
  isConnected,
  onRefreshStreams,
}: {
  isConnected: boolean;
  onRefreshStreams: () => void;
}) {
  const [showLegacy, setShowLegacy] = useState(false);

  return (
    <HarmonyFormCard title="Legacy tools" eyebrow="Advanced · V1">
      <div className="space-y-3">
        <p className="text-[12px] text-muted-foreground/60 leading-relaxed">
          Legacy V1 forms for old escrows and streams. Not needed for new payments.
        </p>
        <button type="button" onClick={() => setShowLegacy((v) => !v)} className="btn-pay btn-pay-ghost">
          <Wrench className="w-3.5 h-3.5" />
          {showLegacy ? "Hide legacy tools" : "Show legacy tools"}
        </button>
        {showLegacy && isConnected && (
          <PrivateModeGate
            title="Legacy private tools"
            description="Legacy ocUSDC transfers, streams, and stealth inbox actions use wallet-secured FHE transactions."
          >
            <div className="space-y-6 pt-2">
              <OcUSDCTransferForm />
              <CreateStreamForm onCreated={onRefreshStreams} />
              <StealthInbox />
            </div>
          </PrivateModeGate>
        )}
      </div>
    </HarmonyFormCard>
  );
}

export function SettingsPublicWalletNotice() {
  return (
    <PayHarmonyNotice title="Public Mode settings">
      Configure the passkey smart account for visible USDC sends. Private ocUSDC permissions, contacts, and legacy
      FHE tools remain in Private Mode.
    </PayHarmonyNotice>
  );
}
