"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

export type CandidateRecord = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  position: string;
  linkedin_url: string | null;
  cv_url: string | null;
  status: string;
  stage: string;
  experience_years: number;
  notes_count: number;
  applied_at: string;
  updated_at: string;
};

type CandidateNote = {
  id: string;
  record_id: string;
  content: string;
  created_at: string;
};

type NotesResponse = {
  data: CandidateNote[];
  meta: {
    total: number;
  };
};

type CandidateInput = {
  full_name: string;
  email: string;
  phone: string;
  position: string;
  linkedin_url: string;
  cv_url: string;
  experience_years: string;
};

type TrackerClientProps = {
  initialRecords: CandidateRecord[];
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://playground.4geeks.com/tracker/api/v1";

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

const STATUS_OPTIONS = Object.keys(STATUS_LABELS);
const STAGE_OPTIONS = Object.keys(STAGE_LABELS);

const emptyInput: CandidateInput = {
  full_name: "",
  email: "",
  phone: "",
  position: "Asistente de Dirección",
  linkedin_url: "",
  cv_url: "",
  experience_years: "",
};

function toLocalDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusLabel(status: string) {
  return STATUS_LABELS[status] ?? "No definido";
}

function stageLabel(stage: string) {
  return STAGE_LABELS[stage] ?? "No definida";
}

export default function TrackerClient({ initialRecords }: TrackerClientProps) {
  const [records, setRecords] = useState<CandidateRecord[]>(initialRecords);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notes, setNotes] = useState<CandidateNote[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const statusFilter = searchParams.get("status") || "all";
  const stageFilter = searchParams.get("stage") || "all";
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [createInput, setCreateInput] = useState<CandidateInput>(emptyInput);
  const [editInput, setEditInput] = useState<CandidateInput>(emptyInput);
  const [editStatus, setEditStatus] = useState("received");
  const [editStage, setEditStage] = useState("pending");

  const selectedRecord = useMemo(
    () => records.find((candidate) => candidate.id === selectedId) ?? null,
    [records, selectedId],
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return records.filter((candidate) => {
      if (statusFilter !== "all" && candidate.status !== statusFilter) return false;
      if (stageFilter !== "all" && candidate.stage !== stageFilter) return false;
      if (!normalized) return true;
      return (
        candidate.full_name.toLowerCase().includes(normalized) ||
        candidate.email.toLowerCase().includes(normalized)
      );
    });
  }, [query, records, stageFilter, statusFilter]);

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Error ${response.status}: ${body}`);
    }

    if (response.status === 204) {
      return null as T;
    }

    return (await response.json()) as T;
  }

  function setEditingFromRecord(record: CandidateRecord | null) {
    if (!record) {
      setEditInput(emptyInput);
      setEditStatus("received");
      setEditStage("pending");
      setNotes([]);
      return;
    }

    setEditInput({
      full_name: record.full_name,
      email: record.email,
      phone: record.phone,
      position: record.position,
      linkedin_url: record.linkedin_url ?? "",
      cv_url: record.cv_url ?? "",
      experience_years: record.experience_years.toString(),
    });
    setEditStatus(record.status);
    setEditStage(record.stage);
  }

  async function loadNotes(recordId: string) {
    try {
      const payload = await request<NotesResponse>(`/records/${recordId}/notes`);
      setNotes(payload.data ?? []);
    } catch {
      setNotes([]);
    }
  }

  async function handleSelectRecord(record: CandidateRecord) {
    setSelectedId(record.id);
    setEditingFromRecord(record);
    await loadNotes(record.id);
  }

  async function handleCreateCandidate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsCreating(true);

    try {
      const created = await request<CandidateRecord>("/records", {
        method: "POST",
        body: JSON.stringify({
          full_name: createInput.full_name,
          email: createInput.email,
          phone: createInput.phone,
          position: createInput.position,
          linkedin_url: createInput.linkedin_url || null,
          cv_url: createInput.cv_url || null,
          experience_years: Number(createInput.experience_years),
        }),
      });

      setRecords((prev) => [created, ...prev]);
      setCreateInput(emptyInput);
      await handleSelectRecord(created);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo crear la candidatura.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function handleSaveRecord(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedRecord) {
      return;
    }

    setErrorMessage(null);
    setIsSaving(true);

    try {
      const updated = await request<CandidateRecord>(`/records/${selectedRecord.id}`, {
        method: "PUT",
        body: JSON.stringify({
          full_name: editInput.full_name,
          email: editInput.email,
          phone: editInput.phone,
          position: editInput.position,
          linkedin_url: editInput.linkedin_url || null,
          cv_url: editInput.cv_url || null,
          experience_years: Number(editInput.experience_years),
        }),
      });

      const patched = await request<CandidateRecord>(`/records/${selectedRecord.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: editStatus,
          stage: editStage,
        }),
      });

      const finalRecord = { ...updated, ...patched };

      setRecords((prev) =>
        prev.map((candidate) =>
          candidate.id === selectedRecord.id ? finalRecord : candidate,
        ),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la candidatura.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedRecord || !newNote.trim()) {
      return;
    }

    setIsAddingNote(true);
    setErrorMessage(null);

    try {
      const created = await request<CandidateNote>(`/records/${selectedRecord.id}/notes`, {
        method: "POST",
        body: JSON.stringify({ content: newNote.trim() }),
      });

      setNotes((prev) => [created, ...prev]);
      setNewNote("");
      setRecords((prev) =>
        prev.map((candidate) =>
          candidate.id === selectedRecord.id
            ? { ...candidate, notes_count: candidate.notes_count + 1 }
            : candidate,
        ),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo guardar la nota.",
      );
    } finally {
      setIsAddingNote(false);
    }
  }

  async function handleDeleteNote(noteId: string) {
    if (!selectedRecord) {
      return;
    }

    try {
      await request<null>(`/records/${selectedRecord.id}/notes/${noteId}`, {
        method: "DELETE",
      });
      setNotes((prev) => prev.filter((item) => item.id !== noteId));
      setRecords((prev) =>
        prev.map((candidate) =>
          candidate.id === selectedRecord.id
            ? { ...candidate, notes_count: Math.max(0, candidate.notes_count - 1) }
            : candidate,
        ),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo borrar la nota.",
      );
    }
  }

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top_right,_rgba(196,181,253,0.35),_transparent_30%),linear-gradient(145deg,_#fffaf0,_#f6f7ff_45%,_#eef8ff)] px-4 py-8 text-slate-900 sm:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
        <header className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-indigo-100/30 backdrop-blur-md">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
            Brasaland Digital · Talent Pipeline Tracker
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Seguimiento de Candidaturas para Asistente de Dirección
          </h1>
          <p className="mt-3 max-w-4xl text-sm text-slate-600 sm:text-base">
            Consulta el pipeline completo, filtra en tiempo real, actualiza etapa/estado,
            corrige datos y registra notas internas sin recargar la página.
          </p>
          <div className="mt-4 grid gap-2 rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-700 md:grid-cols-2">
            <p>
              <span className="font-semibold text-slate-900">Puesto:</span> Asistente de
              Dirección
            </p>
            <p>
              <span className="font-semibold text-slate-900">Empresa:</span> Brasaland
            </p>
            <p>
              <span className="font-semibold text-slate-900">Ubicación:</span> Sede
              corporativa, Medellín
            </p>
            <p>
              <span className="font-semibold text-slate-900">Perfil:</span> Asistencia
              ejecutiva, agenda, viajes corporativos e inglés profesional
            </p>
          </div>
        </header>

        {errorMessage ? (
          <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        {records.length === 0 ? (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            No se pudieron cargar candidaturas iniciales. Revisa NEXT_PUBLIC_API_URL y la
            disponibilidad del backend.
          </div>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-slate-200/50 backdrop-blur-sm">
              <div className="grid gap-3 md:grid-cols-3">
                <label className="md:col-span-1">
                  <span className="mb-1 block text-sm font-semibold text-slate-600">Buscar</span>
                  <input
                    value={query}
                    onChange={(event) => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.set("q", event.target.value);
                      router.replace(`/?${params.toString()}`);
                    }}
                    placeholder="Nombre o correo"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none ring-0 transition focus:border-indigo-500"
                  />
                </label>
                <label>
                  <span className="mb-1 block text-sm font-semibold text-slate-600">Estado</span>
                  <select
                    value={statusFilter}
                    onChange={(event) => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.set("status", event.target.value);
                      router.replace(`/?${params.toString()}`);
                    }}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-indigo-500"
                  >
                    <option value="all">Todos</option>
                    {STATUS_OPTIONS.map((value) => (
                      <option key={value} value={value}>
                        {statusLabel(value)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="mb-1 block text-sm font-semibold text-slate-600">Etapa</span>
                  <select
                    value={stageFilter}
                    onChange={(event) => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.set("stage", event.target.value);
                      router.replace(`/?${params.toString()}`);
                    }}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-indigo-500"
                  >
                    <option value="all">Todas</option>
                    {STAGE_OPTIONS.map((value) => (
                      <option key={value} value={value}>
                        {stageLabel(value)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-lg shadow-slate-200/50 backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">Candidaturas</h2>
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                  {filtered.length} visibles
                </span>
              </div>

              <div className="max-h-[520px] overflow-auto">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 z-10 bg-slate-50/95 text-left text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Nombre</th>
                      <th className="px-4 py-3">Puesto</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3">Etapa</th>
                      <th className="px-4 py-3">Notas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">
                          No hay coincidencias con los filtros actuales.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((candidate) => {
                        const selected = candidate.id === selectedId;

                        return (
                          <tr
                            key={candidate.id}
                            className={`cursor-pointer border-t border-slate-100 text-sm transition ${
                              selected ? "bg-indigo-50/80" : "hover:bg-slate-50"
                            }`}
                          >
                            <td className="px-4 py-3">
                              <Link href={`/candidates/${candidate.id}`} className="font-semibold text-slate-900 hover:underline">
                                {candidate.full_name}
                              </Link>
                              <p className="text-xs text-slate-500">{candidate.email}</p>
                            </td>
                            <td className="px-4 py-3 text-slate-700">{candidate.position}</td>
                            <td className="px-4 py-3">
                              <span className="rounded-full bg-slate-900 px-2 py-1 text-xs font-semibold text-white">
                                {statusLabel(candidate.status)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-700">{stageLabel(candidate.stage)}</td>
                            <td className="px-4 py-3 text-slate-700">{candidate.notes_count}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-lg shadow-slate-200/50 backdrop-blur-sm">
              <h2 className="text-base font-semibold">Registrar nueva candidatura</h2>
              <form className="mt-4 grid gap-3" onSubmit={handleCreateCandidate}>
                <input
                  required
                  value={createInput.full_name}
                  onChange={(event) =>
                    setCreateInput((prev) => ({ ...prev, full_name: event.target.value }))
                  }
                  placeholder="Nombre completo"
                  className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-indigo-500"
                />
                <input
                  required
                  type="email"
                  value={createInput.email}
                  onChange={(event) =>
                    setCreateInput((prev) => ({ ...prev, email: event.target.value }))
                  }
                  placeholder="Correo"
                  className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-indigo-500"
                />
                <input
                  required
                  value={createInput.phone}
                  onChange={(event) =>
                    setCreateInput((prev) => ({ ...prev, phone: event.target.value }))
                  }
                  placeholder="Teléfono"
                  className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-indigo-500"
                />
                <input
                  required
                  value={createInput.position}
                  onChange={(event) =>
                    setCreateInput((prev) => ({ ...prev, position: event.target.value }))
                  }
                  placeholder="Puesto"
                  className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-indigo-500"
                />
                <input
                  required
                  type="number"
                  min="0"
                  step="0.5"
                  value={createInput.experience_years}
                  onChange={(event) =>
                    setCreateInput((prev) => ({ ...prev, experience_years: event.target.value }))
                  }
                  placeholder="Años de experiencia"
                  className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-indigo-500"
                />
                <input
                  value={createInput.linkedin_url}
                  onChange={(event) =>
                    setCreateInput((prev) => ({ ...prev, linkedin_url: event.target.value }))
                  }
                  placeholder="LinkedIn URL"
                  className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-indigo-500"
                />
                <input
                  value={createInput.cv_url}
                  onChange={(event) =>
                    setCreateInput((prev) => ({ ...prev, cv_url: event.target.value }))
                  }
                  placeholder="CV URL"
                  className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-indigo-500"
                />
                <button
                  disabled={isCreating}
                  className="mt-1 h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isCreating ? "Creando..." : "Crear candidatura"}
                </button>
              </form>
            </section>

            <section className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-lg shadow-slate-200/50 backdrop-blur-sm">
              <h2 className="text-base font-semibold">Detalle de candidatura</h2>
              {!selectedRecord ? (
                <p className="mt-3 text-sm text-slate-500">
                  Selecciona una candidatura para editar su estado, etapa y datos.
                </p>
              ) : (
                <>
                  <p className="mt-2 text-xs text-slate-500">
                    Última actualización: {toLocalDate(selectedRecord.updated_at)}
                  </p>
                  <form className="mt-4 grid gap-3" onSubmit={handleSaveRecord}>
                    <input
                      required
                      value={editInput.full_name}
                      onChange={(event) =>
                        setEditInput((prev) => ({ ...prev, full_name: event.target.value }))
                      }
                      className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-indigo-500"
                    />
                    <input
                      required
                      type="email"
                      value={editInput.email}
                      onChange={(event) =>
                        setEditInput((prev) => ({ ...prev, email: event.target.value }))
                      }
                      className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-indigo-500"
                    />
                    <input
                      required
                      value={editInput.phone}
                      onChange={(event) =>
                        setEditInput((prev) => ({ ...prev, phone: event.target.value }))
                      }
                      className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-indigo-500"
                    />
                    <input
                      required
                      value={editInput.position}
                      onChange={(event) =>
                        setEditInput((prev) => ({ ...prev, position: event.target.value }))
                      }
                      className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-indigo-500"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={editStatus}
                        onChange={(event) => setEditStatus(event.target.value)}
                        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-indigo-500"
                      >
                        {STATUS_OPTIONS.map((value) => (
                          <option key={value} value={value}>
                            {statusLabel(value)}
                          </option>
                        ))}
                      </select>
                      <select
                        value={editStage}
                        onChange={(event) => setEditStage(event.target.value)}
                        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-indigo-500"
                      >
                        {STAGE_OPTIONS.map((value) => (
                          <option key={value} value={value}>
                            {stageLabel(value)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={editInput.experience_years}
                      onChange={(event) =>
                        setEditInput((prev) => ({ ...prev, experience_years: event.target.value }))
                      }
                      className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-indigo-500"
                    />
                    <input
                      value={editInput.linkedin_url}
                      onChange={(event) =>
                        setEditInput((prev) => ({ ...prev, linkedin_url: event.target.value }))
                      }
                      placeholder="LinkedIn URL"
                      className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-indigo-500"
                    />
                    <input
                      value={editInput.cv_url}
                      onChange={(event) =>
                        setEditInput((prev) => ({ ...prev, cv_url: event.target.value }))
                      }
                      placeholder="CV URL"
                      className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-indigo-500"
                    />
                    <button
                      disabled={isSaving}
                      className="h-11 rounded-xl bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSaving ? "Guardando cambios..." : "Guardar cambios"}
                    </button>
                  </form>
                </>
              )}
            </section>

            <section className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-lg shadow-slate-200/50 backdrop-blur-sm">
              <h2 className="text-base font-semibold">Notas internas</h2>
              {!selectedRecord ? (
                <p className="mt-3 text-sm text-slate-500">
                  Selecciona un candidato para gestionar notas de entrevistas o llamadas.
                </p>
              ) : (
                <>
                  <form onSubmit={handleAddNote} className="mt-4 flex gap-2">
                    <input
                      value={newNote}
                      onChange={(event) => setNewNote(event.target.value)}
                      placeholder="Escribe una nota interna"
                      className="h-10 flex-1 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-indigo-500"
                    />
                    <button
                      disabled={isAddingNote || !newNote.trim()}
                      className="h-10 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      Agregar
                    </button>
                  </form>

                  <ul className="mt-4 max-h-56 space-y-2 overflow-auto pr-1">
                    {notes.length === 0 ? (
                      <li className="rounded-xl border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500">
                        No hay notas para este candidato.
                      </li>
                    ) : (
                      notes.map((note) => (
                        <li
                          key={note.id}
                          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm text-slate-800">{note.content}</p>
                            <button
                              onClick={() => void handleDeleteNote(note.id)}
                              className="text-xs font-semibold text-rose-600 transition hover:text-rose-700"
                            >
                              Borrar
                            </button>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">{toLocalDate(note.created_at)}</p>
                        </li>
                      ))
                    )}
                  </ul>
                </>
              )}
            </section>
          </div>
        </section>
      </div>
    </div>
  );
}
