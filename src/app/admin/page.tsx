import { AdminPanel } from "@/components/AdminPanel";
import { hasAdminPassword } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  const storageHint = process.env.BLOB_READ_WRITE_TOKEN
    ? "Persistencia: Vercel Blob (producción)."
    : "Persistencia: archivo data/novedades.json (ideal para desarrollo local). En Vercel, configurá BLOB_READ_WRITE_TOKEN para que los cambios perduren.";

  return (
    <section className="section admin-page">
      <div className="container">
        <AdminPanel
          passwordConfigured={hasAdminPassword()}
          storageHint={storageHint}
        />
      </div>
    </section>
  );
}
