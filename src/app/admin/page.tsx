import { AdminPanel } from "@/components/AdminPanel";
import { hasAdminPassword } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <section className="section admin-page">
      <div className="container">
        <AdminPanel passwordConfigured={hasAdminPassword()} />
      </div>
    </section>
  );
}
