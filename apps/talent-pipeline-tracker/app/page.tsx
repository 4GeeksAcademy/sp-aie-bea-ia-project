import TrackerClient, { CandidateRecord } from "./tracker-client";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://playground.4geeks.com/tracker/api/v1";

type CandidateListResponse = {
  data: CandidateRecord[];
};

async function getInitialRecords(): Promise<CandidateRecord[]> {
  try {
    const response = await fetch(`${API_BASE}/records?limit=200`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as CandidateListResponse;
    return payload.data ?? [];
  } catch {
    return [];
  }
}

export default async function Home() {
  const initialRecords = await getInitialRecords();
  return <TrackerClient initialRecords={initialRecords} />;
}
