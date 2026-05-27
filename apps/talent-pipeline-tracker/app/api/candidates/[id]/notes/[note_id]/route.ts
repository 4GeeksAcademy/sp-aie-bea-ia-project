export async function DELETE(_req: Request, { params }: { params: { id: string, note_id: string } }) {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://playground.4geeks.com/tracker/api/v1";
  const res = await fetch(`${API_BASE}/records/${params.id}/notes/${params.note_id}`, { method: "DELETE" });
  return new Response(null, { status: res.status });
}
