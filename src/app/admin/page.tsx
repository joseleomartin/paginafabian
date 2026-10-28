import { AdminPanel } from "@/components/AdminPanel";
import { hasAdminPassword } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <section className="admin-page">
      <AdminPanel passwordConfigured={hasAdminPassword()} />
    </section>
  );
}
