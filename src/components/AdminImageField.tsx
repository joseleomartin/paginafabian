"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { prepareImageForUpload } from "@/lib/client-image";
import { MAX_IMAGE_BYTES } from "@/lib/image-upload";

export type ImageFieldState = {
  /** Imagen elegida para subir (ya reducida si hacía falta). */
  file: File | null;
  /** URL temporal para previsualizar `file`. */
  previewUrl: string | null;
  /** El usuario pidió quitar la imagen que ya estaba guardada. */
  removeExisting: boolean;
  /** Mensaje de error de la selección, vacío si no hay. */
  error: string;
  /** Reduciendo/validando la imagen elegida. */
  preparing: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  select: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  /** Descarta la imagen elegida (no toca la que ya estaba guardada). */
  clearSelection: () => void;
  markRemoveExisting: () => void;
  reset: () => void;
};

/** Estado y acciones del selector de imagen; lo comparten todas las pestañas del admin. */
export function useImageField(): ImageFieldState {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeExisting, setRemoveExisting] = useState(false);
  const [error, setError] = useState("");
  const [preparing, setPreparing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Libera la URL temporal cuando cambia o el componente se desmonta.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function clearSelection() {
    setFile(null);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function select(event: ChangeEvent<HTMLInputElement>) {
    const chosen = event.target.files?.[0];
    if (!chosen) return;

    setError("");
    setPreparing(true);
    try {
      const prepared = await prepareImageForUpload(chosen);
      if (prepared.size > MAX_IMAGE_BYTES) {
        setError(
          `La imagen supera el máximo de ${MAX_IMAGE_BYTES / (1024 * 1024)} MB. Probá con una más liviana.`
        );
        clearSelection();
        return;
      }
      setFile(prepared);
      setPreviewUrl(URL.createObjectURL(prepared));
      setRemoveExisting(false);
    } finally {
      setPreparing(false);
    }
  }

  function reset() {
    clearSelection();
    setRemoveExisting(false);
    setError("");
  }

  return {
    file,
    previewUrl,
    removeExisting,
    error,
    preparing,
    inputRef,
    select,
    clearSelection,
    markRemoveExisting: () => setRemoveExisting(true),
    reset,
  };
}

type Props = {
  id: string;
  label: string;
  field: ImageFieldState;
  /** Imagen ya guardada (o la que hoy muestra el sitio), si existe. */
  existingImageUrl?: string;
  /** Permite quitar la imagen guardada, no solo reemplazarla. */
  allowRemoveExisting?: boolean;
  hint?: string;
  disabled?: boolean;
};

export function AdminImageField({
  id,
  label,
  field,
  existingImageUrl,
  allowRemoveExisting = false,
  hint = "JPG, PNG o WebP. Las fotos grandes se reducen automáticamente.",
  disabled = false,
}: Props) {
  const visibleImage =
    field.previewUrl ?? (field.removeExisting ? undefined : existingImageUrl);
  const canRemove =
    Boolean(field.file) || (allowRemoveExisting && Boolean(visibleImage));

  function handleRemove() {
    if (field.file) {
      field.clearSelection();
      return;
    }
    field.markRemoveExisting();
  }

  return (
    <div className="form-field admin-image-field">
      <label htmlFor={id}>{label}</label>
      {visibleImage ? (
        <div className="admin-image-preview">
          {/* Vista previa de un archivo local (blob:) o ya subido: next/image no aplica. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={visibleImage} alt="Vista previa de la imagen" />
        </div>
      ) : null}
      <div className="admin-image-actions">
        <input
          ref={field.inputRef}
          id={id}
          className="admin-image-input"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={field.select}
          disabled={disabled || field.preparing}
        />
        <label htmlFor={id} className="btn btn-secondary">
          {field.preparing
            ? "Procesando…"
            : visibleImage
              ? "Cambiar imagen"
              : "Subir imagen"}
        </label>
        {canRemove ? (
          <button
            type="button"
            className="btn btn-ghost-dark"
            onClick={handleRemove}
            disabled={disabled || field.preparing}
          >
            {field.file ? "Descartar selección" : "Quitar imagen"}
          </button>
        ) : null}
      </div>
      {field.error ? <p className="admin-error">{field.error}</p> : null}
      <p className="form-note">{hint}</p>
    </div>
  );
}
