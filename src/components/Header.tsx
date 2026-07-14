"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navLinks, siteConfig } from "@/lib/content";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    return () => document.body.classList.remove("menu-open");
  }, [open]);

  const headerClass = [
    "site-header",
    scrolled || !isHome || open ? "scrolled" : "over-hero",
    open ? "menu-open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <header className={headerClass}>
        <div className="container site-header-inner">
          <Link
            href="/"
            className="logo"
            aria-label={`${siteConfig.name}, inicio`}
          >
            Fabián Canoni<span>.</span>
          </Link>

          <nav className="nav" aria-label="Principal">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link href="/contacto" className="btn btn-primary nav-cta">
            Conversemos
          </Link>

          <button
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
          </button>
        </div>
      </header>

      <nav
        id="mobile-nav"
        className={`mobile-nav${open ? " open" : ""}`}
        aria-label="Menú móvil"
        hidden={!open}
      >
        <Link href="/">Inicio</Link>
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
        <Link
          href="/contacto"
          className="btn btn-primary"
          style={{ marginTop: "1.5rem", width: "fit-content" }}
        >
          Conversemos
        </Link>
      </nav>
    </>
  );
}
