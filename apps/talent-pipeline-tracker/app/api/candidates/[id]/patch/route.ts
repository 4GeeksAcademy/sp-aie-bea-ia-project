import { NextRequest } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://playground.4geeks.com/tracker/api/v1";
  const body = await req.json();
  const res = await fetch(`${API_BASE}/records/${params.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return new Response(JSON.stringify(data), { status: res.status, headers: { "Content-Type": "application/json" } });
}
