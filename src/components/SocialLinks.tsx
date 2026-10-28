import { socialNetworks } from "@/lib/content";
import {
  IconInstagram,
  IconLinkedIn,
  IconYouTube,
} from "@/components/SocialIcons";

const icons = {
  linkedin: IconLinkedIn,
  instagram: IconInstagram,
  youtube: IconYouTube,
} as const;

type Variant = "hero" | "cards" | "icons";

type SocialLinksProps = {
  variant?: Variant;
  className?: string;
};

export function SocialLinks({
  variant = "hero",
  className = "",
}: SocialLinksProps) {
  if (variant === "icons") {
    return (
      <nav
        className={`social-icons ${className}`.trim()}
        aria-label="Redes sociales"
      >
        {socialNetworks.map((network) => {
          const Icon = icons[network.id];
          return (
            <a
              key={network.id}
              href={network.href}
              className="social-icon-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={network.cta}
            >
              <Icon width={20} height={20} />
            </a>
          );
        })}
      </nav>
    );
  }

  if (variant === "cards") {
    return (
      <div className={`social-cards ${className}`.trim()}>
        {socialNetworks.map((network) => {
          const Icon = icons[network.id];
          return (
            <a
              key={network.id}
              href={network.href}
              className="social-card"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="social-card-icon" aria-hidden="true">
                <Icon width={22} height={22} />
              </span>
              <span className="social-card-body">
                <strong>{network.name}</strong>
                <span>{network.blurb}</span>
              </span>
              <span className="social-card-cta">{network.cta}</span>
            </a>
          );
        })}
      </div>
    );
  }

  return (
    <nav
      className={`hero-social ${className}`.trim()}
      aria-label="Redes sociales"
    >
      {socialNetworks.map((network) => {
        const Icon = icons[network.id];
        return (
          <a
            key={network.id}
            href={network.href}
            className="hero-social-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon width={18} height={18} />
            <span className="hero-social-name">{network.name}</span>
          </a>
        );
      })}
    </nav>
  );
}
