export const siteConfig = {
  name: "RMFlow",
  tagline: "The way to yourself...",
  description:
    "Авторские программы Рауля Мудрика для внутренней опоры, продуктивности, эмоционального баланса и силы.",
  defaultUrl: "https://example.com",
  brandLogo:
    "https://res.cloudinary.com/dohehigsm/image/upload/q_auto/f_auto/v1777399769/RMFlow_fzv04u.png",
  heroImage:
    "https://res.cloudinary.com/dohehigsm/image/upload/q_auto/f_auto/v1777399349/hero_ocbvjl.png",
  galleryBackground:
    "https://res.cloudinary.com/dohehigsm/image/upload/q_auto/f_auto/v1777399348/gallery_background_yqrdgw.png",
  methodImage:
    "https://res.cloudinary.com/dohehigsm/image/upload/q_auto/f_auto/v1777399347/whatIDo_chfgaa.png",
  aboutImage:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1400&q=80",
  contactsImage:
    "https://res.cloudinary.com/dohehigsm/image/upload/q_auto/f_auto/v1777399349/hero_ocbvjl.png"
} as const;

export function getSiteUrl(): URL {
  const configuredUrl = import.meta.env.PUBLIC_SITE_URL || siteConfig.defaultUrl;
  return new URL(configuredUrl);
}

