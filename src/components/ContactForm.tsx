"use client";

import { FormEvent, useState } from "react";
import { siteConfig } from "@/lib/content";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const company = String(data.get("company") || "").trim();
    const message = String(data.get("message") || "").trim();

    const subject = encodeURIComponent(`Consulta desde la web: ${name}`);
    const body = encodeURIComponent(
      `Nombre: ${name}\nEmail: ${email}\nEmpresa: ${company || "Sin indicar"}\n\n${message}`
    );

    // Abre el cliente de correo con los datos del formulario.
    // TODO: conectar a un endpoint de envío (Formspree, Resend, etc.) cuando esté disponible.
    window.location.href = `mailto:${siteConfig.email}?subject=${subject}&body=${body}`;
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="form-success" role="status">
        Se abrió tu cliente de correo para completar el envío. Si preferís,
        escribime directo a{" "}
        <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a> o por{" "}
        <a href={siteConfig.whatsapp} target="_blank" rel="noopener noreferrer">
          WhatsApp
        </a>
        .
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="form-field">
        <label htmlFor="name">Nombre</label>
        <input id="name" name="name" type="text" required autoComplete="name" />
      </div>
      <div className="form-field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="form-field">
        <label htmlFor="company">Empresa</label>
        <input id="company" name="company" type="text" autoComplete="organization" />
      </div>
      <div className="form-field">
        <label htmlFor="message">¿En qué podemos trabajar juntos?</label>
        <textarea id="message" name="message" required />
      </div>
      <button type="submit" className="btn btn-primary">
        Enviar mensaje
      </button>
      <p className="form-note">
        También podés escribir a {siteConfig.email} o llamar al {siteConfig.phone}.
      </p>
    </form>
  );
}
