/**
 * ContactsPage — full-page address-book view (route: /pay/contacts).
 * UI shell only; address-book logic unchanged.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  Loader2,
  ArrowUpRight,
  BookUser,
} from "lucide-react";

import { HarmonyAppShell } from "@/components/harmony/HarmonyAppShell";
import { AppWorkspaceChrome } from "@/components/harmony/AppWorkspaceChrome";
import { HarmonyFormCard } from "@/components/harmony/harmony-ui";
import { Input } from "@/components/ui/input";
import AddContactModal from "@/components/pay-v4/AddContactModal";
import { useAddressBook } from "@/hooks/useAddressBook";

export default function ContactsPage() {
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
      /* error surfaced below */
    }
  };

  return (
    <HarmonyAppShell
      searchPlaceholder="Search contacts…"
    >
      <AppWorkspaceChrome
        eyebrow="Obscura · Pay"
        title="Private contacts."
        description="Encrypted on-chain address book. Labels are kept locally; only hashes and FHE-encrypted targets live on-chain."
        actions={
          <Link to="/settings?section=contacts" className="dash-btn-outline h-9 px-3 text-xs">
            Pay settings
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        }
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-xs text-muted-foreground">
          {contacts.length} contact{contacts.length === 1 ? "" : "s"}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={isLoading}
            className="dash-btn-outline h-9 px-3 text-xs"
          >
            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Refresh"}
          </button>
          <button type="button" onClick={() => setOpen(true)} className="dash-btn-primary h-9 px-3 text-xs">
            <Plus className="h-3.5 w-3.5" />
            Add contact
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-[var(--dash-radius-lg)] border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
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
            <button type="button" onClick={() => setOpen(true)} className="dash-btn-primary mt-6 h-9 px-4 text-xs">
              <Plus className="h-3.5 w-3.5" />
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
                className="dash-list-row"
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[hsl(var(--success)/0.25)] bg-[hsl(var(--success)/0.08)] font-mono text-[11px] text-[hsl(var(--success))]">
                  {idStr}
                </div>
                <div className="min-w-0 flex-1">
                  {isEditing ? (
                    <Input
                      value={draftLabel}
                      onChange={(e) => setDraftLabel(e.target.value)}
                      autoFocus
                      className="h-9 text-xs"
                    />
                  ) : (
                    <div className="truncate text-sm text-foreground">
                      {c.label ?? <span className="text-muted-foreground/50">Contact #{idStr}</span>}
                    </div>
                  )}
                  <div className="truncate font-mono text-[10px] text-muted-foreground/60">
                    {c.labelHash} · created {new Date(Number(c.createdAt) * 1000).toLocaleString()}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => void saveEdit(idStr)}
                        disabled={isPending}
                        className="dash-btn-outline grid h-8 w-8 place-items-center p-0"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        disabled={isPending}
                        className="dash-btn-outline grid h-8 w-8 place-items-center p-0"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => startEdit(idStr, c.label)}
                        disabled={isPending}
                        className="dash-btn-outline grid h-8 w-8 place-items-center p-0"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void removeContact(c.contactId)}
                        disabled={isPending}
                        className="dash-btn-outline grid h-8 w-8 place-items-center p-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
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
    </HarmonyAppShell>
  );
}
