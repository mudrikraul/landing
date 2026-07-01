export type Theme = "light" | "dark";

export interface SeoConfig {
  title: string;
  description: string;
  canonicalPath: string;
  image?: string;
  noindex?: boolean;
}

export interface NavItem {
  label: string;
  href: `#${string}` | `/${string}`;
}

export interface SocialLink {
  label: string;
  href?: string;
  icon: "instagram" | "telegram" | "youtube";
}

export interface GalleryItem {
  id: string;
  type: "image" | "youtube";
  title: string;
  caption: string;
  description: string;
  previewUrl: string;
  mediaUrl: string;
}

export interface MethodLink {
  label: string;
  target: `#${string}`;
  desktopColumn: "left" | "right";
  desktopRow: number;
  mobileOrder: number;
}

export interface Program {
  id: "compass" | "productivity" | "balance" | "strength" | "rejuvenation";
  variant: "compass" | "productivity" | "balance" | "strength" | "rejuvenation";
  theme: Theme;
  title: string;
  accentTitle?: string;
  accentPosition?: "before" | "after";
  subtitle?: string;
  intro?: string;
  listTitle?: string;
  bullets: readonly string[];
  bonus?: string;
  resultTitle?: string;
  result: string;
  duration: string;
  price: string;
  image: string;
  desktopBackgroundImage?: string;
}

export interface Certificate {
  title: string;
  image: string;
}

export interface TrustBenefit {
  title: string;
  text: string;
}
