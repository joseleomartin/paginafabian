import Image from "next/image";
import { images } from "@/lib/images";
import { siteConfig } from "@/lib/content";

type Props = {
  /** Tamaño del avatar en rem. */
  size?: number;
};

/** Identidad del panel: avatar de Fabián, nombre y rol de la herramienta. */
export function AdminBrand({ size = 3 }: Props) {
  return (
    <div className="adm-brand">
      <span
        className="adm-brand-avatar"
        style={{ width: `${size}rem`, height: `${size}rem` }}
      >
        <Image
          src={images.avatar.src}
          alt=""
          width={images.avatar.width}
          height={images.avatar.height}
          sizes={`${size * 16}px`}
          priority
        />
      </span>
      <span className="adm-brand-text">
        <strong>{siteConfig.name}</strong>
        <small>Panel del sitio</small>
      </span>
    </div>
  );
}
