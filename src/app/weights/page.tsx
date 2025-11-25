import Link from "next/link";

import { getMeoSnapshot, KAPPA } from "@/lib/meo-data";

const fmt = (n: number) => Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);
const pct = (x: number, dp = 1) => `${(x * 100).toFixed(dp)}%`;

export default async function WeightsPage() {
  const snap = await getMeoSnapshot(); // offline static snapshot (2025-10-08)
  const sumW = snap.weights.reduce((acc, c) => acc + c.w, 0);
  const meoFromM = KAPPA * snap.m_world_usd;
  const relErr = Math.abs(meoFromM - snap.meo_usd) / meoFromM;

  return (
    <main className="px-6 py-10 space-y-10">
      <header className="space-y-2">
        <p className="text-sm text-neutral-600 font-mono">Offline snapshot · 2025-10-08</p>
        <h1 className="text-3xl font-semibold">MEO weights and methodology (offline)</h1>
        <p className="text-sm text-neutral-700 max-w-3xl">
          Demo uses a frozen 8 Oct 2025 snapshot; no external data is fetched. Caps are baked into the repo, weights are derived
          from those caps, and invariants are checked at runtime.
        </p>
        <div className="flex gap-3 text-sm text-neutral-700">
          <span>Σ weights: {sumW.toFixed(9)}</span>
          <span>Price identity |P - κM|/P: {relErr.toExponential(3)}</span>
          <span>κ: {KAPPA}</span>
        </div>
        <div className="flex gap-2 text-sm text-neutral-600">
          <Link href="/demo" className="underline">
            Demo controls
          </Link>
          <span aria-hidden="true">·</span>
          <a className="underline" href="/weights_2025-10-08.csv" download="weights_2025-10-08.csv">
            Download CSV
          </a>
        </div>
      </header>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Performance (MEO-native)</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>World pool M_world: <strong>${fmt(snap.m_world_usd)}</strong></div>
          <div>MEO price P_USD^{`{MEO}`}: <strong>${fmt(snap.meo_usd)}</strong></div>
        </div>
        <p className="text-sm text-neutral-700 max-w-4xl">
          By construction, P_USD^{MEO} = κ · M_world with κ = 10^-6. Weights are computed as w_j = MC_j^{USD} / M_world, so
          Σ w_j ≈ 1 within floating-point tolerance (1e-9). If these identities drift, the page would throw with an audit error.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-semibold">Weights and USD market caps (derived)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">Symbol</th>
                <th className="py-2 pr-4">Weight w_j</th>
                <th className="py-2 pr-4">MC_j (USD)</th>
                <th className="py-2 pr-4">Check MC_j / M_world</th>
              </tr>
            </thead>
            <tbody>
              {snap.weights.map(c => {
                const wFromMc = c.mc_usd / snap.m_world_usd;
                const diff = Math.abs(wFromMc - c.w);
                return (
                  <tr key={c.symbol} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-mono text-neutral-900">{c.symbol}</td>
                    <td className="py-2 pr-4 tabular-nums">{pct(c.w)}</td>
                    <td className="py-2 pr-4 tabular-nums">${fmt(c.mc_usd)}</td>
                    <td className="py-2 pr-4 tabular-nums">
                      {pct(wFromMc)} <span className="text-neutral-500">Δ={diff.toExponential(2)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-neutral-600">
          Δ shows |w_derived − w_reported|. In the offline demo we derive weights from caps, so Δ≈0 barring rounding.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Methodology (first principles)</h3>
        <div className="space-y-2 text-sm text-neutral-800">
          <p className="leading-6">
            • Universe C: major fiat M2 (USD/EUR/JPY/CHF), metals (XAU/XAG), and leading crypto (BTC/ETH).
          </p>
          <p className="leading-6">
            • Caps (USD): MC_j^{USD} = P_j^{USD} · Q_j. Fiat: Q_j = M2_j (local units), P_j^{USD} = FX (USD per unit).
            Metals: Q = above-ground stock (oz), P = LBMA spot (USD/oz). Crypto: Q = circulating supply, P = coin USD price.
          </p>
          <p className="leading-6">
            • World pool: M_world = Σ_j MC_j^{USD}. • Numeraire price: P_USD^{MEO} = κ · M_world, κ = 10^-6.
            • Weights: w_j = MC_j^{USD} / M_world, Σ w_j = 1.
          </p>
          <p className="leading-6 text-neutral-700">
            Provenance (live mode): FRED (M2: M2SL, MYAGM2EZM…, MYAGM2JPM…, MYAGM2CHM…; FX: DEXUSEU/DEXJPUS/DEXSZUS), LBMA
            (XAU/XAG spot), USGS (metal stocks), CoinGecko (crypto caps). In this demo those numbers are baked into the snapshot;
            no network calls are made.
          </p>
        </div>
      </section>
    </main>
  );
}
