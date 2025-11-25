import weights from "@/data/weights_2025-10-08.json";

export type MeoWeight = { symbol: string; w: number; mc_usd: number };
export type MeoSnapshot = {
  date: string;
  meo_usd: number;
  m_world_usd: number;
  weights: MeoWeight[];
};

const OFFLINE_DATE = "2025-10-08";

export async function getMeoSnapshot(): Promise<MeoSnapshot> {
  console.info(`[MEO] offline snapshot: ${OFFLINE_DATE}`);
  return weights as MeoSnapshot;
}
