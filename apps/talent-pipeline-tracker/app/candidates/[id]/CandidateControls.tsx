"use client";
import { useState } from "react";

const STATUS_LABELS = {
  received: "Recibida",
  in_progress: "En proceso",
  selected: "Seleccionada",
  discarded: "Descartada",
};
const STAGE_LABELS = {
  pending: "Pendiente de revisión",
  review: "En revisión",
  personal_interview: "Entrevista personal",
  technical_interview: "Entrevista técnica",
  offer_presented: "Oferta presentada",
};
const STATUS_OPTIONS = Object.keys(STATUS_LABELS);
const STAGE_OPTIONS = Object.keys(STAGE_LABELS);

export default function CandidateControls({ id, status, stage, onChange }: { id: string, status: string, stage: string, onChange: () => void }) {
  const [editStatus, setEditStatus] = useState(status);
  const [editStage, setEditStage] = useState(stage);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await fetch(`/api/candidates/${id}/patch`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: editStatus, stage: editStage }),
      });
      onChange();
    } catch (err) {
      setError("Error al actualizar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="flex gap-2 items-end mt-4" onSubmit={handleSave}>
      <label className="flex flex-col text-xs">
        Estado
        <select value={editStatus} onChange={e => setEditStatus(e.target.value)} className="rounded border px-2 py-1">
          {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{STATUS_LABELS[opt]}</option>)}
        </select>
      </label>
      <label className="flex flex-col text-xs">
        Etapa
        <select value={editStage} onChange={e => setEditStage(e.target.value)} className="rounded border px-2 py-1">
          {STAGE_OPTIONS.map(opt => <option key={opt} value={opt}>{STAGE_LABELS[opt]}</option>)}
        </select>
      </label>
      <button type="submit" disabled={saving} className="rounded bg-indigo-600 text-white px-3 py-2 text-xs font-semibold disabled:opacity-60">{saving ? "Guardando..." : "Guardar"}</button>
      {error && <span className="text-xs text-rose-600 ml-2">{error}</span>}
    </form>
  );
}
