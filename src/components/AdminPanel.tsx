"use client";

import {
  FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AdminBrand } from "@/components/AdminBrand";
import { AdminContentManager } from "@/components/AdminContentManager";
import { AdminDashboard } from "@/components/AdminDashboard";
import {
  IconBroadcast,
  IconExternal,
  IconLogout,
  IconNews,
  IconOverview,
} from "@/components/AdminIcons";
import { AdminNoticiasManager } from "@/components/AdminNoticiasManager";

type Tab = "resumen" | "noticias" | "contenido";

type TabDefinition = {
  id: Tab;
  label: string;
  Icon: typeof IconOverview;
};

const TABS: readonly TabDefinition[] = [
  { id: "resumen", label: "Resumen", Icon: IconOverview },
  { id: "noticias", label: "Novedades", Icon: IconNews },
  { id: "contenido", label: "Contenido", Icon: IconBroadcast },
];

const SECTION_COPY: Record<Tab, { title: string; lead: string }> = {
  resumen: {
    title: "Hola, Fabián",
    lead: "Así viene el contenido del sitio.",
  },
  noticias: {
    title: "Novedades",
    lead: "Cargá charlas, eventos y anuncios, con su imagen.",
  },
  contenido: {
    title: "Newsletter, podcast y tips",
    lead: "Se sincronizan solos desde LinkedIn y YouTube; acá podés corregirlos o sumar uno a mano.",
  },
};

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

type Props = {
  passwordConfigured: boolean;
};

function CenteredCard({ children }: { children: ReactNode }) {
  return (
    <div className="admin-center">
      <div className="admin-card">{children}</div>
    </div>
  );
}

export function AdminPanel({ passwordConfigured }: Props) {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<Tab>("resumen");

  const markUnauthorized = useCallback(() => setAuthed(false), []);
  const today = useMemo(() => dateFormatter.format(new Date()), []);

  // Un pedido autenticado liviano decide si ya hay una sesión válida.
  useEffect(() => {
    fetch("/api/admin/session", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { authenticated: false }))
      .then((data: { authenticated?: boolean }) => setAuthed(data.authenticated === true))
      .catch(() => setAuthed(false))
      .finally(() => setChecking(false));
  }, []);

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLoginError(data.error || "No se pudo iniciar sesión.");
        return;
      }
      setPassword("");
      setTab("resumen");
      setAuthed(true);
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
    setLoginError("");
  }

  if (!passwordConfigured) {
    return (
      <CenteredCard>
        <p className="eyebrow">Admin</p>
        <h1>Panel de administración</h1>
        <p className="lead">
          Configurá la variable de entorno <code>ADMIN_PASSWORD</code> y
          reiniciá el servidor para habilitar el acceso.
        </p>
      </CenteredCard>
    );
  }

  if (checking) {
    return (
      <CenteredCard>
        <p>Cargando panel…</p>
      </CenteredCard>
    );
  }

  if (!authed) {
    return (
      <div className="admin-center">
        <div className="admin-card admin-login">
          <div className="admin-login-brand">
            <AdminBrand size={3.5} />
          </div>
          <div className="admin-login-body">
            <h1>Ingresar</h1>
            <p>Gestioná las novedades, la newsletter y el podcast del sitio.</p>
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
              {loginError ? <p className="admin-error">{loginError}</p> : null}
              <button type="submit" className="btn btn-primary" disabled={busy}>
                Entrar
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const copy = SECTION_COPY[tab];

  return (
    <div className="adm">
      <aside className="adm-side">
        <AdminBrand />

        <nav
          className="adm-nav"
          role="tablist"
          aria-label="Secciones del panel"
          aria-orientation="vertical"
        >
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              id={`admin-tab-${id}`}
              aria-selected={tab === id}
              aria-controls="admin-tabpanel"
              onClick={() => setTab(id)}
            >
              <Icon />
              {label}
            </button>
          ))}
        </nav>

        <div className="adm-side-foot">
          <a href="/" target="_blank" rel="noopener noreferrer">
            <IconExternal />
            Ver el sitio
          </a>
          <button type="button" onClick={handleLogout}>
            <IconLogout />
            Salir
          </button>
        </div>
      </aside>

      <main className="adm-main">
        <header className="adm-head">
          {tab === "resumen" ? <p className="adm-eyebrow">{today}</p> : null}
          <h1>{copy.title}</h1>
          <p className="adm-lead">{copy.lead}</p>
        </header>

        <div
          id="admin-tabpanel"
          role="tabpanel"
          aria-labelledby={`admin-tab-${tab}`}
        >
          {tab === "resumen" ? (
            <AdminDashboard
              onUnauthorized={markUnauthorized}
              onNavigate={setTab}
            />
          ) : null}
          {tab === "noticias" ? (
            <AdminNoticiasManager onUnauthorized={markUnauthorized} />
          ) : null}
          {tab === "contenido" ? (
            <AdminContentManager onUnauthorized={markUnauthorized} />
          ) : null}
        </div>
      </main>
    </div>
  );
}
