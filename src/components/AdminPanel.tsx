"use client";

import { FormEvent, useEffect, useState } from "react";
import type { Novedad, NovedadType } from "@/lib/novedades";

type FormState = {
  type: NovedadType;
  title: string;
  summary: string;
  date: string;
  href: string;
  youtubeId: string;
  published: boolean;
};

const emptyForm = (): FormState => ({
  type: "newsletter",
  title: "",
  summary: "",
  date: new Date().toISOString().slice(0, 10),
  href: "",
  youtubeId: "",
  published: true,
});

function toForm(item: Novedad): FormState {
  return {
    type: item.type,
    title: item.title,
    summary: item.summary,
    date: item.date.slice(0, 10),
    href: item.href,
    youtubeId: item.youtubeId || "",
    published: item.published,
  };
}

type Props = {
  passwordConfigured: boolean;
  storageHint: string;
};

export function AdminPanel({ passwordConfigured, storageHint }: Props) {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [items, setItems] = useState<Novedad[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | NovedadType>("all");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadItems() {
    const res = await fetch("/api/novedades?all=1", { cache: "no-store" });
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "No se pudieron cargar las novedades.");
      return;
    }
    const data = await res.json();
    setItems(data.items || []);
    setAuthed(true);
  }

  useEffect(() => {
    loadItems()
      .catch(() => setAuthed(false))
      .finally(() => setChecking(false));
  }, []);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "No se pudo iniciar sesión.");
        return;
      }
      setPassword("");
      await loadItems();
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
    setItems([]);
  }

  function startEdit(item: Novedad) {
    setEditingId(item.id);
    setForm(toForm(item));
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm());
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const payload = {
        type: form.type,
        title: form.title,
        summary: form.summary,
        date: form.date,
        href: form.href,
        youtubeId: form.youtubeId,
        published: form.published,
      };
      const res = await fetch(
        editingId ? `/api/novedades/${editingId}` : "/api/novedades",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "No se pudo guardar.");
        return;
      }
      setMessage(editingId ? "Novedad actualizada." : "Novedad publicada.");
      resetForm();
      await loadItems();
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta novedad?")) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/novedades/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "No se pudo eliminar.");
        return;
      }
      if (editingId === id) resetForm();
      setMessage("Novedad eliminada.");
      await loadItems();
    } finally {
      setBusy(false);
    }
  }

  const visible = items.filter(
    (item) => filter === "all" || item.type === filter
  );

  if (!passwordConfigured) {
    return (
      <div className="admin-card">
        <p className="eyebrow">Admin</p>
        <h1>Panel de novedades</h1>
        <p className="lead">
          Configurá la variable de entorno <code>ADMIN_PASSWORD</code> y
          reiniciá el servidor para habilitar el acceso.
        </p>
        <p className="form-note">{storageHint}</p>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="admin-card">
        <p>Cargando panel…</p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="admin-card admin-card-narrow">
        <p className="eyebrow">Admin</p>
        <h1>Ingresar</h1>
        <p>Gestioná novedades de newsletter y podcast.</p>
        <form className="contact-form" onSubmit={handleLogin}>
          <div className="form-field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error ? <p className="admin-error">{error}</p> : null}
          <button type="submit" className="btn btn-primary" disabled={busy}>
            Entrar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-grid">
      <section className="admin-card">
        <div className="admin-header">
          <div>
            <p className="eyebrow">Admin</p>
            <h1>Novedades</h1>
            <p className="form-note">{storageHint}</p>
          </div>
          <button type="button" className="btn btn-secondary" onClick={handleLogout}>
            Salir
          </button>
        </div>

        <form className="contact-form" onSubmit={handleSave}>
          <div className="admin-form-row">
            <div className="form-field">
              <label htmlFor="type">Tipo</label>
              <select
                id="type"
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    type: e.target.value as NovedadType,
                  }))
                }
              >
                <option value="newsletter">Newsletter</option>
                <option value="podcast">Podcast</option>
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="date">Fecha</label>
              <input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="title">Título</label>
            <input
              id="title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="summary">Resumen</label>
            <textarea
              id="summary"
              value={form.summary}
              onChange={(e) =>
                setForm((f) => ({ ...f, summary: e.target.value }))
              }
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="href">Enlace</label>
            <input
              id="href"
              type="url"
              placeholder="https://…"
              value={form.href}
              onChange={(e) => setForm((f) => ({ ...f, href: e.target.value }))}
              required
            />
          </div>

          {form.type === "podcast" ? (
            <div className="form-field">
              <label htmlFor="youtubeId">ID de YouTube (opcional)</label>
              <input
                id="youtubeId"
                placeholder="ej. Nf2calxXrms"
                value={form.youtubeId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, youtubeId: e.target.value }))
                }
              />
            </div>
          ) : null}

          <label className="admin-check">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) =>
                setForm((f) => ({ ...f, published: e.target.checked }))
              }
            />
            Publicada en el sitio
          </label>

          {error ? <p className="admin-error">{error}</p> : null}
          {message ? <p className="admin-ok">{message}</p> : null}

          <div className="btn-group">
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {editingId ? "Guardar cambios" : "Publicar novedad"}
            </button>
            {editingId ? (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetForm}
              >
                Cancelar edición
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="admin-card">
        <div className="admin-header">
          <h2>Listado</h2>
          <div className="admin-filters">
            {(
              [
                ["all", "Todas"],
                ["newsletter", "Newsletter"],
                ["podcast", "Podcast"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={
                  filter === value ? "btn btn-primary" : "btn btn-secondary"
                }
                onClick={() => setFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {visible.length === 0 ? (
          <p className="form-note">Todavía no hay novedades en este filtro.</p>
        ) : (
          <ul className="admin-list">
            {visible.map((item) => (
              <li key={item.id}>
                <div>
                  <p className="eyebrow">
                    {item.type === "newsletter" ? "Newsletter" : "Podcast"}
                    {item.published ? "" : " · borrador"}
                  </p>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  <p className="form-note">
                    {item.date} · {item.href}
                  </p>
                </div>
                <div className="btn-group">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => startEdit(item)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost-dark"
                    onClick={() => handleDelete(item.id)}
                    disabled={busy}
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
