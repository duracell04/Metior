# Mêtior (MEΩ) — The Universal Numéraire

*Open math. Deterministic capital. Allocate in MEΩ.*

---

## Why this exists (plain English)

Reporting P&L in USD/CHF/EUR **bakes currency luck and inflation** into your “alpha.”
**Mêtior (MEΩ)** is a **capitalization-weighted yard-stick for money itself**—built from **fiat M2**, **gold/silver**, and **leading crypto**.
Price returns **in MEΩ** and you see **pure economic performance**, not FX/CPI noise.

**Value, at a glance**

* **Currency-neutral truth.** Stop riding USD/CHF cycles—compare apples to apples.
* **Crisis-adaptive.** If a component dies, its weight → 0; MEΩ renormalizes.
* **Audit-friendly.** Rules are public; data sources are open; outputs are reproducible.

---

## 1) What MEΩ is (and isn’t)

**It is**

* A **numéraire** (unit of account), not a fund or a token promise.
* A daily **basket of money** constructed from public data.
* A clean reference unit to denominate **prices, returns, and risk**.

**It isn’t**

* A stablecoin. Supply can be fixed **if** you tokenize, but **price floats** with world money.
* A pool of custodied assets—it’s a **measurement standard**.

---

## 2) The math (short & exact)

Let ( \mathcal C(t)) be the set of monetary species at time (t):
**fiats** (USD/EUR/JPY/CHF **M2**), **metals** (**XAU**/**XAG** above-ground stock), **crypto** (**BTC/ETH** free-float).

**Market cap (USD)**
[
MC^{USD}_j(t)=P^{USD}_j(t),Q_j(t)
]

* Fiat: (Q_j)=M2
* Metals: above-ground stock (oz)
* Crypto: circulating **free-float**

**World pool**
[
M_{\text{world}}(t)=\sum_{j\in \mathcal C(t)} MC^{USD}_j(t)
]

**Scale constant** (default)
[
\kappa = 10^{-6}
]

**MEΩ price (USD)**
[
P^{\text{ME}\Omega}*{USD}(t)=\kappa,M*{\text{world}}(t)
]

**Weights (sum to 1)**
[
w_j(t)=\frac{MC^{USD}*j(t)}{M*{\text{world}}(t)}
]

**Returns in MEΩ (currency-neutral)**
[
r_{i,\text{ME}\Omega}(t)
=\Delta\ln!\Big(\frac{P^{USD}*i(t)}{P^{\text{ME}\Omega}*{USD}(t)}\Big)
]

> **Interpretation.** One MEΩ is the **millionth** of the world money aggregate.
> If (M_{\text{world}}=174\ \text{trn USD}) ⇒ (P^{\text{ME}\Omega}_{USD}\approx 174\ \text{million USD}).
> Your asset’s return in MEΩ measures performance against **the whole money universe**.

**Stable adaptive weights (for intuition)**
[
\mathrm d w_j = w_j!\left[r^{(\lambda)}_j-\sum_k w_k r^{(\lambda)}_k\right]\mathrm dt,\quad
r^{(\lambda)}_j=\mathrm{clip}(r_j,-5\sigma_j,5\sigma_j)
]
(Clip keeps the update Lipschitz under jumps; discrete code simply re-normalizes.)

---

## 3) What you get from this repo

* **Spec & equations** (this README)
* **Reproducible examples** to compute MEΩ price and weights from open feeds
* **Audit snippets** (SQL + JSON shape) you can drop into your systems
* **Governance rules** (simple and deterministic)

> If you want a full product demo, see **Metiseon** (the MEΩ-native robo-allocator). This repo is the **MEΩ standard** itself. [Metiseon](https://metiseon.akalabs.dev/)
<!-- https://github.com/duracell04/metiseon -->

---

## 4) Quickstart — compute MEΩ locally (open data only)

> Works with plain Python. Replace the simple caps below with real pulls (FRED/LBMA/CoinGecko/Yahoo).

```bash
pip install pandas requests yfinance fredapi duckdb
```

```python
# examples/compute_meo.py (drop into repo and run with: python examples/compute_meo.py)
import pandas as pd

# 1) Example caps (USD). Replace with live pulls from FRED/LBMA/CoinGecko/Yahoo.
caps = {
  "USD": 21.5e12, "EUR": 16.8e12, "JPY": 8.6e12, "CHF": 1.25e12,
  "XAU": 22.1e12, "XAG": 2.6e12,
  "BTC": 2.26e12, "ETH": 0.30e12
}

# 2) World pool & MEΩ price
kappa = 1e-6
df = pd.DataFrame(list(caps.items()), columns=["symbol","mc_usd"])
M_world = df["mc_usd"].sum()
P_meo_usd = kappa * M_world

# 3) Weights (sum to 1)
df["weight"] = df["mc_usd"] / M_world

# 4) Sanity checks
assert abs(df["weight"].sum()-1) < 1e-9
print("MEΩ price (USD):", f"{P_meo_usd:,.0f}")
print(df.sort_values("weight", ascending=False))
```

**Audit SQL (DuckDB/SQLite)**
If you persist daily rows, this is the audit query you publish:

```sql
-- Latest disclosed basket
SELECT date, symbol, ROUND(weight*100,2) AS pct, meo_usd, m_world_usd
FROM benchmarks
WHERE date = (SELECT MAX(date) FROM benchmarks)
ORDER BY weight DESC
LIMIT 10;
```

---

## 5) Risk & performance in MEΩ

**Volatility**

* Realised σ on (r_{i,\text{ME}\Omega}) (rolling window)
* (Optional) GARCH(1,1) on (r_{i,\text{ME}\Omega})

**Tail risk**

* EVT (POT–GPD) for VaR/CVaR **in MEΩ units**

**GINα (MEΩ Global Interest-Rate Neutral Alpha)**
[
\text{GIN}\alpha_t=\frac{1+R^{\text{ME}\Omega}_t}{1+r^{\text{ME}\Omega}_{f,t}+\pi^{\text{ME}\Omega}_t}-1-\text{carry}_t
]
Removes global funding & inflation to isolate **true skill**.

---

## 6) Governance (minimal, explicit)

* **Inclusion.** Fiat: public M2. Metals: auditable stock×spot. Crypto: **free-float** mcap. Threshold: **≥ 1 % of MEΩ** (policy band OK).
* **Cadence.** Daily recompute from open feeds; **no human overrides**.
* **Delisting.** Stale data > 60 days or liquidity collapse ⇒ weight→0; renormalize.
* **Change control.** Any rule change ⇒ version bump + migration note. Forks welcome.

---

## 7) File/API shapes (so you can wire it in fast)

**CSV: `weights_YYYYMMDD.csv`**

```
date,symbol,weight,meo_usd,m_world_usd
2025-11-21,USD,0.210,125600000,125600000000000
2025-11-21,EUR,0.162,125600000,125600000000000
...
```

**JSON: `/meo/weights?date=YYYY-MM-DD`**

```json
{
  "date": "2025-11-21",
  "meo_usd": 125600000,
  "m_world_usd": 125600000000000,
  "weights": [
    {"symbol":"USD","w":0.210},
    {"symbol":"EUR","w":0.162},
    {"symbol":"XAU","w":0.195},
    {"symbol":"BTC","w":0.035}
  ]
}
```

**Unit tests you should enforce**

* `abs(sum(weights)-1) < 1e-9`
* `P_meo_usd == kappa * sum(mc_usd)` within 1 bp
* No NaNs in latest row; data sources stamped with timestamps.

---

## 8) FAQ (two-liners)

**Is MEΩ a stablecoin?** No—**it’s a yard-stick**. Supply can be fixed; price floats with world money.
**Why κ = 10⁻⁶?** Clean decimals and human-readable price; if tokenized, fixed supply (Q=1/\kappa=10^6).
**Why not SDR/CPI?** SDR is fiat-only and governance-heavy; CPI is consumption, not money. **MEΩ is money-native, rule-only, adaptive.**
**Can I hedge MEΩ?** Yes—via components today; ETN/futures later for direct hedging.

---

## 9) Roadmap (v0 → v1)

* **v0:** daily MEΩ price & weights; CSV/JSON drops; examples & audit SQL; risk in MEΩ (σ/CVaR); **GINα**.
* **v1:** public dashboard; oracle stub with Merkle/zk proofs; documentation site; (optional) ETN/futures design note.

---

## 10) License & disclaimer

* **Spec & brand assets:** MIT (see `LICENSE`).
* **Disclaimer:** Prototype math; educational reference; **no investment advice**.

---

### One-liner for the repo header

> **MEΩ = the universal yard-stick for value.** Open rules, public data, daily weights. Price everything in MEΩ and see the **real** performance.

---

**Tip:** If you’re wiring MEΩ into your allocator/risk engine, start by computing **returns in MEΩ** for your assets. The rest (σ, CVaR, alpha) follows—and the FX fog disappears.
