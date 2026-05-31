import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowDown, Check, ChevronDown, Download, Shield, Smartphone } from "lucide-react";
import SpadeLandingNav from "@/components/landing/spade/SpadeLandingNav";
import SpadeFooter from "@/components/landing/spade/SpadeFooter";
import MobilePhoneMockup from "@/components/landing/spade/MobilePhoneMockup";
import {
  MOBILE_APP_FOREST_GRADIENT,
  MOBILE_APP_FOREST_SECTION,
} from "@/components/landing/spade/mobileAppScreenshots";
import {
  fetchMobileReleases,
  formatBytes,
  getLatestRelease,
  type MobileReleasesManifest,
} from "@/lib/mobileDownloads";

function ReleaseRow({
  release,
  isLatest,
}: {
  release: MobileReleasesManifest["releases"][number];
  isLatest: boolean;
}) {
  const [showHash, setShowHash] = useState(false);
  const sizeLabel = formatBytes(release.sizeBytes);

  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-xl font-semibold tracking-tight text-white">
              v{release.version}
            </h2>
            {isLatest ? (
              <span className="rounded-full bg-lime-accent/20 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-lime-accent">
                Latest
              </span>
            ) : null}
            <span className="rounded-full border border-white/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">
              {release.label}
            </span>
          </div>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-white/40">
            Published {release.publishedAt}
            {release.minAndroid ? ` · Android ${release.minAndroid}+` : null}
            {sizeLabel ? ` · ${sizeLabel}` : null}
          </p>
          {release.notes?.length ? (
            <ul className="mt-4 space-y-1.5 text-sm leading-relaxed text-white/60">
              {release.notes.map((note) => (
                <li key={note} className="flex gap-2">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-lime-accent" aria-hidden />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {release.sha256 ? (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setShowHash((v) => !v)}
                className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-white/35 transition-colors hover:text-white/55"
              >
                <ChevronDown
                  className={`size-3.5 transition-transform ${showHash ? "rotate-180" : ""}`}
                  aria-hidden
                />
                Verify SHA-256
              </button>
              {showHash ? (
                <p className="mt-2 break-all font-mono text-[10px] leading-relaxed text-white/35">
                  {release.sha256}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <a
          href={release.downloadPath}
          download={release.fileName}
          className="inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-xl border border-lime-accent/30 bg-lime-accent/15 px-5 py-3 text-sm font-medium text-lime-accent transition-colors hover:border-lime-accent/45 hover:bg-lime-accent/25"
        >
          <Download className="size-4" aria-hidden />
          Download APK
        </a>
      </div>
    </article>
  );
}

export default function MobileDownloadPage() {
  const [manifest, setManifest] = useState<MobileReleasesManifest | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMobileReleases()
      .then(setManifest)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load releases.");
      });
  }, []);

  const latest = useMemo(
    () => (manifest ? getLatestRelease(manifest) : undefined),
    [manifest],
  );

  const latestSize = formatBytes(latest?.sizeBytes);

  return (
    <div className="landing-spade min-h-screen bg-forest text-white">
      <SpadeLandingNav />

      <main className={`${MOBILE_APP_FOREST_SECTION} min-h-[calc(100vh-4rem)] px-4 py-16 sm:px-5 sm:py-20 lg:px-8 lg:py-24`}>
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{ background: MOBILE_APP_FOREST_GRADIENT.background }}
        />

        <div className="relative mx-auto grid w-full max-w-[1200px] items-start gap-14 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16 xl:gap-20">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:sticky lg:top-28"
          >
            <MobilePhoneMockup />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-lime-accent/80">
              Obscura Mobile
            </p>
            <h1 className="mt-4 font-display text-3xl font-medium leading-[1.08] tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
              Download the{" "}
              <span className="text-lime-accent">Android app</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/55 md:text-[17px]">
              Grab the latest build below and sideload it on your Android device. One install gives
              you Pay, Govern, and Credit — connect with WalletConnect and pick up where you left
              off on the web.
            </p>

            {latest ? (
              <a
                href={latest.downloadPath}
                download={latest.fileName}
                className="mt-8 flex min-h-[56px] w-full max-w-md items-center gap-3 rounded-xl border border-white/15 bg-white/[0.06] px-5 py-3.5 text-sm font-medium text-white transition-colors hover:border-white/25 hover:bg-white/[0.1] sm:w-auto"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-lime-accent/20">
                  <Smartphone className="size-5 text-lime-accent" aria-hidden />
                </span>
                <span className="min-w-0 flex-1 text-left">
                  <span className="block font-display text-base text-white">
                    Get latest — v{latest.version}
                  </span>
                  <span className="block truncate text-xs text-white/45">
                    {latest.fileName}
                    {latestSize ? ` · ${latestSize}` : ""}
                  </span>
                </span>
                <ArrowDown className="size-4 shrink-0 text-white/50" aria-hidden />
              </a>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
              <span>Pay · Govern · Credit</span>
              <span>FHE encrypted</span>
              <span>Arbitrum Sepolia</span>
            </div>

            <section className="mt-12 space-y-4">
              <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                Available builds
              </h2>

              {error ? (
                <p className="rounded-xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                  {error}
                </p>
              ) : null}

              {!manifest && !error ? (
                <p className="text-sm text-white/45">Loading releases…</p>
              ) : null}

              {manifest?.releases.map((release) => (
                <ReleaseRow
                  key={`${release.version}-${release.fileName}`}
                  release={release}
                  isLatest={release.version === manifest.latestVersion}
                />
              ))}
            </section>

            {manifest?.installSteps?.length ? (
              <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/[0.06]">
                    <Shield className="size-4 text-lime-accent/90" aria-hidden />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-medium text-white">
                      Install on Android
                    </h2>
                    <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-white/55">
                      {manifest.installSteps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                    <p className="mt-4 text-xs leading-relaxed text-white/35">
                      Testnet only — connect Arbitrum Sepolia and use Circle&apos;s faucet for USDC
                      before sealing to ocUSDC.
                    </p>
                  </div>
                </div>
              </section>
            ) : null}

            <p className="mt-10 text-sm text-white/45">
              Prefer the browser?{" "}
              <Link to="/pay" className="font-medium text-white/70 underline-offset-2 hover:text-white hover:underline">
                Open Obscura Pay on the web
              </Link>
              {" · "}
              <Link to="/#mobile-app" className="font-medium text-white/70 underline-offset-2 hover:text-white hover:underline">
                Back to mobile preview
              </Link>
            </p>
          </motion.div>
        </div>
      </main>

      <SpadeFooter />
    </div>
  );
}
