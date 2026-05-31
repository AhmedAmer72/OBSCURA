import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ValuesRevealCtx = {
  /** Master nav toggle — reveals / hides all sealed values at once. */
  revealed: boolean;
  toggle: () => void;
  setRevealed: (value: boolean) => void;
  /** Increments whenever master hide runs — resets per-card local state. */
  hideEpoch: number;
};

const Ctx = createContext<ValuesRevealCtx | null>(null);

export function ValuesRevealProvider({ children }: { children: ReactNode }) {
  const [revealed, setRevealedState] = useState(false);
  const [hideEpoch, setHideEpoch] = useState(0);

  const setRevealed = useCallback((value: boolean) => {
    setRevealedState(value);
    if (!value) setHideEpoch((epoch) => epoch + 1);
  }, []);

  const toggle = useCallback(() => {
    setRevealedState((current) => {
      if (current) setHideEpoch((epoch) => epoch + 1);
      return !current;
    });
  }, []);

  const value = useMemo(
    () => ({ revealed, toggle, setRevealed, hideEpoch }),
    [revealed, toggle, setRevealed, hideEpoch],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useValuesReveal(): ValuesRevealCtx {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useValuesReveal must be used inside <ValuesRevealProvider>");
  }
  return ctx;
}

export function useValuesRevealOptional(): ValuesRevealCtx | null {
  return useContext(Ctx);
}

/**
 * Per-card cipher reveal — independent of master, except master hide resets all cards.
 * Master ON → all cards visible unless individually force-hidden.
 * Master OFF → only cards with local reveal stay visible.
 */
export function useCardCipherReveal() {
  const { revealed: masterRevealed, hideEpoch } = useValuesReveal();
  const [localRevealed, setLocalRevealed] = useState(false);
  const [forceHidden, setForceHidden] = useState(false);

  useEffect(() => {
    setLocalRevealed(false);
    setForceHidden(false);
  }, [hideEpoch]);

  useEffect(() => {
    if (masterRevealed) setForceHidden(false);
  }, [masterRevealed]);

  const isVisible = (masterRevealed && !forceHidden) || (!masterRevealed && localRevealed);

  const toggle = useCallback(() => {
    if (masterRevealed) {
      setForceHidden((hidden) => !hidden);
      return;
    }
    setLocalRevealed((local) => !local);
  }, [masterRevealed]);

  return { isVisible, toggle, masterRevealed };
}
