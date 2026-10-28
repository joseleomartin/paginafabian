"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { AdminImageField, useImageField } from "@/components/AdminImageField";
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

function toFormData(form: FormState, image: File | null): FormData {
  const data = new FormData();
  data.set("type", form.type);
  data.set("title", form.title);
  data.set("summary", form.summary);
  data.set("date", form.date);
  data.set("href", form.href);
  data.set("youtubeId", form.youtubeId);
  data.set("published", String(form.published));
  if (image) data.set("image", image);
  return data;
}

/** La imagen que hoy muestra el sitio para este contenido (la propia o la miniatura de YouTube). */
function displayedImageUrl(item: Novedad): string | undefined {
  if (item.imageUrl) return item.imageUrl;
  return item.youtubeId
    ? `https://i.ytimg.com/vi/${item.youtubeId}/hqdefault.jpg`
    : undefined;
}

type Props = {
  onUnauthorized: () => void;
};

/** Gestión manual de newsletter y podcast (se sincronizan solos; esto sirve para corregir o agregar). */
export function AdminContentManager({ onUnauthorized }: Props) {
  const [items, setItems] = useState<Novedad[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | undefined>();
  const image = useImageField();
  const [filter, setFilter] = useState<"all" | NovedadType>("all");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const loadItems = useCallback(async () => {
    const res = await fetch("/api/novedades?all=1", { cache: "no-store" });
    if (res.status === 401) {
      onUnauthorized();
      return;
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "No se pudieron cargar los contenidos.");
      return;
    }
    const data = await res.json();
    setItems(data.items || []);
    setError("");
  }, [onUnauthorized]);

  useEffect(() => {
    loadItems().catch(() => setError("No se pudieron cargar los contenidos."));
  }, [loadItems]);

  function startEdit(item: Novedad) {
    setEditingId(item.id);
    setForm(toForm(item));
    setExistingImageUrl(displayedImageUrl(item));
    image.reset();
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm());
    setExistingImageUrl(undefined);
    image.reset();
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch(
        editingId ? `/api/novedades/${editingId}` : "/api/novedades",
        {
          method: editingId ? "PUT" : "POST",
          body: toFormData(form, image.file),
        }
      );
      if (res.status === 401) {
        onUnauthorized();
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "No se pudo guardar.");
        return;
      }
      setMessage(editingId ? "Contenido actualizado." : "Contenido publicado.");
      resetForm();
      await loadItems();
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este contenido?")) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/novedades/${id}`, { method: "DELETE" });
      if (res.status === 401) {
        onUnauthorized();
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "No se pudo eliminar.");
        return;
      }
      if (editingId === id) resetForm();
      setMessage("Contenido eliminado.");
      await loadItems();
    } finally {
      setBusy(false);
    }
  }

  const visible = items.filter(
    (item) => filter === "all" || item.type === filter
  );

  return (
    <div className="admin-grid">
      <section className="admin-card">
        <div className="admin-header">
          <div>
            <p className="eyebrow">Newsletter y podcast</p>
            <h2>{editingId ? "Editar contenido" : "Agregar contenido"}</h2>
            <p className="form-note">
              Se sincronizan solos desde LinkedIn y YouTube. Usá esto solo para
              corregir o agregar algo puntual.
            </p>
          </div>
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

          <AdminImageField
            id="content-image"
            label="Imagen (opcional)"
            field={image}
            existingImageUrl={existingImageUrl}
            hint={
              editingId
                ? "Si subís una nueva, reemplaza a la que muestra hoy el sitio. JPG, PNG o WebP."
                : "Si no subís ninguna, el sitio usa la de la fuente (miniatura de YouTube o portada de LinkedIn). JPG, PNG o WebP."
            }
            disabled={busy}
          />

          <label className="admin-check">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) =>
                setForm((f) => ({ ...f, published: e.target.checked }))
              }
            />
            Publicado en el sitio
          </label>

          {error ? <p className="admin-error">{error}</p> : null}
          {message ? <p className="admin-ok">{message}</p> : null}

          <div className="btn-group">
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {editingId ? "Guardar cambios" : "Publicar contenido"}
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
                ["all", "Todos"],
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
          <p className="form-note">Todavía no hay contenidos en este filtro.</p>
        ) : (
          <ul className="admin-list">
            {visible.map((item) => (
              <li key={item.id}>
                <div
                  className={
                    displayedImageUrl(item)
                      ? "admin-list-item-media admin-list-item-media--with-thumb"
                      : "admin-list-item-media"
                  }
                >
                  {displayedImageUrl(item) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className="admin-thumb"
                      src={displayedImageUrl(item)}
                      alt=""
                      loading="lazy"
                    />
                  ) : null}
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
