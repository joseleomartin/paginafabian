"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { AdminImageField, useImageField } from "@/components/AdminImageField";
import { formatDate } from "@/lib/format-date";
import {
  NOTICIA_BODY_MAX,
  NOTICIA_TITLE_MAX,
  type Noticia,
} from "@/lib/noticias-model";

type FormState = {
  title: string;
  body: string;
  date: string;
  href: string;
  published: boolean;
};

const emptyForm = (): FormState => ({
  title: "",
  body: "",
  date: new Date().toISOString().slice(0, 10),
  href: "",
  published: true,
});

function toForm(item: Noticia): FormState {
  return {
    title: item.title,
    body: item.body,
    date: item.date,
    href: item.href ?? "",
    published: item.published,
  };
}

function toFormData(
  form: FormState,
  image: File | null,
  removeImage: boolean
): FormData {
  const data = new FormData();
  data.set("title", form.title);
  data.set("body", form.body);
  data.set("date", form.date);
  data.set("href", form.href);
  data.set("published", String(form.published));
  if (removeImage) data.set("removeImage", "1");
  if (image) data.set("image", image);
  return data;
}

const EXCERPT_LENGTH = 180;

function excerpt(text: string): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > EXCERPT_LENGTH ? `${flat.slice(0, EXCERPT_LENGTH)}…` : flat;
}

type Props = {
  onUnauthorized: () => void;
};

/** Alta, edición y baja de las novedades del sitio, con imagen. */
export function AdminNoticiasManager({ onUnauthorized }: Props) {
  const [items, setItems] = useState<Noticia[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | undefined>();
  const image = useImageField();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const loadItems = useCallback(async () => {
    const res = await fetch("/api/noticias?all=1", { cache: "no-store" });
    if (res.status === 401) {
      onUnauthorized();
      return;
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "No se pudieron cargar las novedades.");
      return;
    }
    const data = await res.json();
    setItems(data.items || []);
  }, [onUnauthorized]);

  useEffect(() => {
    loadItems().catch(() => setError("No se pudieron cargar las novedades."));
  }, [loadItems]);

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm());
    setExistingImageUrl(undefined);
    image.reset();
  }

  function startEdit(item: Noticia) {
    setEditingId(item.id);
    setForm(toForm(item));
    setExistingImageUrl(item.imageUrl);
    image.reset();
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function send(
    url: string,
    method: "POST" | "PUT",
    body: FormData
  ): Promise<boolean> {
    const res = await fetch(url, { method, body });
    if (res.status === 401) {
      onUnauthorized();
      return false;
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "No se pudo guardar.");
      return false;
    }
    return true;
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const saved = await send(
        editingId ? `/api/noticias/${editingId}` : "/api/noticias",
        editingId ? "PUT" : "POST",
        toFormData(form, image.file, image.removeExisting)
      );
      if (!saved) return;
      setMessage(editingId ? "Novedad actualizada." : "Novedad publicada.");
      resetForm();
      await loadItems();
    } finally {
      setBusy(false);
    }
  }

  async function handleTogglePublished(item: Noticia) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const saved = await send(
        `/api/noticias/${item.id}`,
        "PUT",
        toFormData({ ...toForm(item), published: !item.published }, null, false)
      );
      if (!saved) return;
      setMessage(item.published ? "Novedad oculta del sitio." : "Novedad publicada.");
      await loadItems();
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(item: Noticia) {
    if (!confirm(`¿Eliminar "${item.title}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`/api/noticias/${item.id}`, { method: "DELETE" });
      if (res.status === 401) {
        onUnauthorized();
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "No se pudo eliminar.");
        return;
      }
      if (editingId === item.id) resetForm();
      setMessage("Novedad eliminada.");
      await loadItems();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-grid">
      <section className="admin-card">
        <div className="admin-header">
          <div>
            <p className="eyebrow">Novedades del sitio</p>
            <h2>{editingId ? "Editar novedad" : "Nueva novedad"}</h2>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSave}>
          <div className="form-field">
            <label htmlFor="noticia-title">Título</label>
            <input
              id="noticia-title"
              value={form.title}
              maxLength={NOTICIA_TITLE_MAX}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="noticia-body">Texto</label>
            <textarea
              id="noticia-body"
              rows={7}
              value={form.body}
              maxLength={NOTICIA_BODY_MAX}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              required
            />
            <p className="form-note">
              {form.body.length}/{NOTICIA_BODY_MAX} · Dejá una línea en blanco
              para separar párrafos.
            </p>
          </div>

          <AdminImageField
            id="noticia-image"
            label="Imagen (opcional)"
            field={image}
            existingImageUrl={existingImageUrl}
            allowRemoveExisting
            disabled={busy}
          />

          <div className="admin-form-row">
            <div className="form-field">
              <label htmlFor="noticia-date">Fecha</label>
              <input
                id="noticia-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="noticia-href">Enlace (opcional)</label>
              <input
                id="noticia-href"
                type="url"
                placeholder="https://…"
                value={form.href}
                onChange={(e) => setForm((f) => ({ ...f, href: e.target.value }))}
              />
            </div>
          </div>

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
              {busy
                ? "Guardando…"
                : editingId
                  ? "Guardar cambios"
                  : "Publicar novedad"}
            </button>
            {editingId ? (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetForm}
                disabled={busy}
              >
                Cancelar edición
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="admin-card">
        <div className="admin-header">
          <h2>Publicadas y borradores</h2>
        </div>

        {items.length === 0 ? (
          <p className="form-note">
            Todavía no cargaste novedades. Completá el formulario para publicar
            la primera.
          </p>
        ) : (
          <ul className="admin-list">
            {items.map((item) => (
              <li key={item.id}>
                <div
                  className={
                    item.imageUrl
                      ? "admin-list-item-media admin-list-item-media--with-thumb"
                      : "admin-list-item-media"
                  }
                >
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="admin-thumb" src={item.imageUrl} alt="" />
                  ) : null}
                  <div>
                    <p className="eyebrow">
                      {formatDate(item.date)}
                      {item.published ? "" : " · borrador"}
                    </p>
                    <h3>{item.title}</h3>
                    <p>{excerpt(item.body)}</p>
                  </div>
                </div>
                <div className="btn-group">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => startEdit(item)}
                    disabled={busy}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleTogglePublished(item)}
                    disabled={busy}
                  >
                    {item.published ? "Ocultar" : "Publicar"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost-dark"
                    onClick={() => handleDelete(item)}
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
