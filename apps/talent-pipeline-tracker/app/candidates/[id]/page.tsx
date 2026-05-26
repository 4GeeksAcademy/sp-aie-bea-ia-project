import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
const CandidateControls = dynamic(() => import("./CandidateControls"), { ssr: false });

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://playground.4geeks.com/tracker/api/v1";

async function getCandidate(id: string) {
  const res = await fetch(`${API_BASE}/records/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

async function getNotes(id: string) {
  const res = await fetch(`${API_BASE}/records/${id}/notes`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data ?? [];
}

const STATUS_LABELS: Record<string, string> = {
  received: "Recibida",
  in_progress: "En proceso",
  selected: "Seleccionada",
  discarded: "Descartada",
};
const STAGE_LABELS: Record<string, string> = {
  pending: "Pendiente de revisión",
  review: "En revisión",
  personal_interview: "Entrevista personal",
  technical_interview: "Entrevista técnica",
  offer_presented: "Oferta presentada",
};

function toLocalDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function CandidateDetail({ params }: { params: { id: string } }) {
  const candidate = await getCandidate(params.id);
  if (!candidate) return notFound();
  const notes = await getNotes(params.id);

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-2">{candidate.full_name}</h1>
      <div className="mb-4 text-sm text-slate-700">
        <div><b>Puesto:</b> {candidate.position}</div>
        <div><b>Email:</b> {candidate.email}</div>
        <div><b>Teléfono:</b> {candidate.phone}</div>
        <div><b>Estado:</b> {STATUS_LABELS[candidate.status] ?? "No definido"}</div>
        <div><b>Etapa:</b> {STAGE_LABELS[candidate.stage] ?? "No definida"}</div>
        <div><b>Años de experiencia:</b> {candidate.experience_years}</div>
        <div><b>LinkedIn:</b> {candidate.linkedin_url ? <a href={candidate.linkedin_url} className="text-blue-700 underline" target="_blank">{candidate.linkedin_url}</a> : "-"}</div>
        <div><b>CV:</b> {candidate.cv_url ? <a href={candidate.cv_url} className="text-blue-700 underline" target="_blank">Descargar</a> : "-"}</div>
        <div><b>Aplicó:</b> {toLocalDate(candidate.applied_at)}</div>
        <div><b>Última actualización:</b> {toLocalDate(candidate.updated_at)}</div>
        <CandidateControls id={candidate.id} status={candidate.status} stage={candidate.stage} onChange={async () => {}} />
      </div>
      <h2 className="text-lg font-semibold mt-6 mb-2">Notas internas</h2>
      <ul className="space-y-2">
        {notes.length === 0 ? <li className="text-slate-500">No hay notas para este candidato.</li> :
          notes.map((note: any) => (
            <li key={note.id} className="border rounded-xl px-3 py-2 bg-slate-50">
              <div className="text-sm">{note.content}</div>
              <div className="text-xs text-slate-500 mt-1">{toLocalDate(note.created_at)}</div>
            </li>
          ))}
      </ul>
    </div>
  );
}
