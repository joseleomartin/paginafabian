import Link from "next/link";
import { SocialLinks } from "@/components/SocialLinks";
import { navLinks, siteConfig } from "@/lib/content";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div>
            <div className="footer-brand">
              Fabián Canoni<span>.</span>
            </div>
            <p className="footer-tagline">{siteConfig.tagline}</p>
            <SocialLinks variant="icons" className="footer-social" />
          </div>
          <Link href="/contacto" className="btn btn-primary">
            Conversemos
          </Link>
        </div>

        <div className="footer-grid">
          <div>
            <div className="footer-title">Navegación</div>
            <div className="footer-links">
              <Link href="/">Inicio</Link>
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="footer-title">Contenido</div>
            <div className="footer-links">
              <Link href="/en-clave-pyme">En Clave PyME</Link>
              <Link href="/off-the-record">Off the Record</Link>
              <a
                href={siteConfig.social.newsletter}
                target="_blank"
                rel="noopener noreferrer"
              >
                Newsletter
              </a>
              <a
                href={siteConfig.social.podcast}
                target="_blank"
                rel="noopener noreferrer"
              >
                Podcast en YouTube
              </a>
            </div>
          </div>

          <div>
            <div className="footer-title">Contacto</div>
            <div className="footer-links">
              <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
              <a href={siteConfig.whatsapp} target="_blank" rel="noopener noreferrer">
                {siteConfig.phone}
              </a>
              <span>{siteConfig.address}</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © {year} {siteConfig.name}
          </span>
          <span>{siteConfig.role}</span>
        </div>
      </div>
    </footer>
  );
}
