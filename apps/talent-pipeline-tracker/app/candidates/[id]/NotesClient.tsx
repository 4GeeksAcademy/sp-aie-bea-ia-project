"use client";
import { useState } from "react";

function toLocalDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function NotesClient({ id, initialNotes }: { id: string, initialNotes: any[] }) {
  const [notes, setNotes] = useState(initialNotes);
  const [newNote, setNewNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNote.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/candidates/${id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newNote }),
      });
      if (!res.ok) throw new Error("Error al guardar nota");
      const note = await res.json();
      setNotes([note, ...notes]);
      setNewNote("");
    } catch {
      setError("No se pudo guardar la nota");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteNote(noteId: string) {
    if (!confirm("¿Eliminar esta nota?")) return;
    try {
      await fetch(`/api/candidates/${id}/notes/${noteId}`, { method: "DELETE" });
      setNotes(notes.filter(n => n.id !== noteId));
    } catch {
      setError("No se pudo borrar la nota");
    }
  }

  return (
    <div>
      <form onSubmit={handleAddNote} className="flex gap-2 mb-4">
        <input value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Escribe una nota interna" className="flex-1 rounded border px-2 py-1 text-sm" />
        <button type="submit" disabled={saving || !newNote.trim()} className="rounded bg-emerald-600 text-white px-3 py-1 text-sm font-semibold disabled:opacity-60">{saving ? "Guardando..." : "Agregar"}</button>
      </form>
      {error && <div className="text-xs text-rose-600 mb-2">{error}</div>}
      <ul className="space-y-2">
        {notes.length === 0 ? <li className="text-slate-500">No hay notas para este candidato.</li> :
          notes.map((note: any) => (
            <li key={note.id} className="border rounded-xl px-3 py-2 bg-slate-50 flex justify-between items-start">
              <div>
                <div className="text-sm">{note.content}</div>
                <div className="text-xs text-slate-500 mt-1">{toLocalDate(note.created_at)}</div>
              </div>
              <button onClick={() => handleDeleteNote(note.id)} className="ml-2 text-xs text-rose-600 hover:underline">Borrar</button>
            </li>
          ))}
      </ul>
    </div>
  );
}
