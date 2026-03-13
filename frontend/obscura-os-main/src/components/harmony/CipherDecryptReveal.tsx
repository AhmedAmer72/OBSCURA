import type { ReactNode } from "react";

import { AnimatePresence, motion, useReducedMotion, type Transition } from "framer-motion";

import { cn } from "@/lib/utils";

import { CipherMask, type CipherMaskSize } from "@/components/harmony/CipherMask";

import { MatrixDecryptText } from "@/components/harmony/MatrixDecryptText";



export type CipherValueTone = "metric" | "glance" | "compact";



const revealEase = [0.16, 1, 0.3, 1] as const;

const maskExitEase = [0.4, 0, 0.2, 1] as const;



const maskExitTransition: Transition = { duration: 0.34, ease: maskExitEase };

const valueRevealTransition: Transition = { duration: 0.58, ease: revealEase };



const maskExit = {

  opacity: 0,

  filter: "blur(10px)",

  scale: 0.92,

  transition: maskExitTransition,

};



const valueReveal = {

  opacity: [0, 0.35, 0.72, 1],

  filter: ["blur(16px)", "blur(8px)", "blur(2px)", "blur(0px)"],

  scale: [1.05, 1.02, 1.005, 1],

  transition: valueRevealTransition,

};



const valueExit = {

  opacity: 0,

  filter: "blur(8px)",

  scale: 0.97,

  transition: { duration: 0.28, ease: maskExitEase },

};



const toneClass: Record<CipherValueTone, string> = {

  metric: "cipher-decrypt-value cipher-decrypt-value--metric stat-number dash-metric-value tabular-nums text-foreground",

  glance: "cipher-decrypt-value cipher-decrypt-value--glance tabular-nums text-foreground",

  compact: "cipher-decrypt-value cipher-decrypt-value--compact tabular-nums text-foreground",

};



const stageMinHeight: Record<CipherValueTone, string> = {

  metric: "cipher-decrypt-stage--metric",

  glance: "cipher-decrypt-stage--glance",

  compact: "cipher-decrypt-stage--compact",

};



export function CipherDecryptReveal({

  revealed,

  value,

  blocks = 6,

  size = "md",

  tone = "metric",

  className,

  suffix,

}: {

  revealed: boolean;

  value?: string | null;

  blocks?: number;

  size?: CipherMaskSize;

  tone?: CipherValueTone;

  className?: string;

  suffix?: ReactNode;

}) {

  const showValue = revealed && value != null && value !== "";

  const reduceMotion = useReducedMotion();

  const revealDuration = reduceMotion ? 0.15 : 0.42;



  return (

    <div className={cn("cipher-decrypt-root min-w-0 w-full max-w-full", className)}>

      <div className={cn("cipher-decrypt-stage", stageMinHeight[tone])}>

        <AnimatePresence mode="wait" initial={false}>

          {showValue ? (

            <motion.div

              key={`revealed-${String(value)}`}

              className="cipher-decrypt-revealed cipher-decrypt-revealed--matrix min-w-0 w-full max-w-full"

              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}

              animate={{ opacity: 1, scale: 1 }}

              exit={valueExit}

              transition={{ duration: revealDuration, ease: revealEase }}

            >

              <div className="cipher-decrypt-revealed__row min-w-0 w-full max-w-full">

                <span className={toneClass[tone]} title={String(value)}>

                  <MatrixDecryptText text={String(value)} active tone={tone} />

                </span>

                {suffix}

              </div>

              <span className="cipher-decrypt-rain" aria-hidden />

              <span className="cipher-decrypt-scan" aria-hidden />

            </motion.div>

          ) : (

            <motion.div

              key="sealed"

              className="cipher-decrypt-sealed min-w-0 max-w-full"

              exit={maskExit}

            >

              <CipherMask blocks={blocks} size={size} />

            </motion.div>

          )}

        </AnimatePresence>

      </div>

    </div>

  );

}



export { maskExit, valueReveal, valueRevealTransition };

