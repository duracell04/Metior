const KAPPA = 1e-6;

type SnapshotRow = { symbol: string; mc_usd: number };
type Snapshot = {
  date: string;
  meo_usd: number;
  m_world_usd: number;
  weights: (SnapshotRow & { weight: number })[];
};

const STATIC_SNAPSHOTS: Record<string, SnapshotRow[]> = {
  "2025-10-08": [
    { symbol: "CNY", mc_usd: 42_492_800_000_000 },
    { symbol: "XAU", mc_usd: 22_113_600_000_000 },
    { symbol: "USD", mc_usd: 21_463_200_000_000 },
    { symbol: "EUR", mc_usd: 16_802_000_000_000 },
    { symbol: "BTC", mc_usd: 2_276_400_000_000 },
    { symbol: "JPY", mc_usd: 1_734_400_000_000 },
    { symbol: "XAG", mc_usd: 1_084_000_000_000 },
    { symbol: "ETH", mc_usd: 433_600_000_000 },
  ],
};

const DEFAULT_STATIC_DATE = "2025-10-08";

const buildSnapshotFromRows = (date: string, rows: SnapshotRow[]): Snapshot => {
  const m_world_usd = rows.reduce((sum, row) => sum + row.mc_usd, 0);
  const weights = rows
    .map(row => ({ ...row, weight: row.mc_usd / m_world_usd }))
    .sort((a, b) => b.weight - a.weight);

  return {
    date,
    meo_usd: KAPPA * m_world_usd,
    m_world_usd,
    weights,
  };
};

const STATIC_SNAPSHOT = buildSnapshotFromRows(DEFAULT_STATIC_DATE, STATIC_SNAPSHOTS[DEFAULT_STATIC_DATE]);

export async function buildMeoSnapshot() {
  console.info(`[MEO] using static MEIc snapshot for ${DEFAULT_STATIC_DATE} (demo mode, no external calls)`);
  return STATIC_SNAPSHOT;
}
