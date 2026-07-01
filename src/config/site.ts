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
  heroDesktopImage:
    "https://res.cloudinary.com/dohehigsm/image/upload/v1782914352/Hero_block_h3qdaw.png",
  galleryBackground:
    "https://res.cloudinary.com/dohehigsm/image/upload/q_auto/f_auto/v1777399348/gallery_background_yqrdgw.png",
  methodImage:
    "https://res.cloudinary.com/dohehigsm/image/upload/q_auto/f_auto/v1777399347/whatIDo_chfgaa.png",
  aboutImage:
    "https://res.cloudinary.com/dohehigsm/image/upload/v1782914352/About_sjmjbt.png",
  contactsImage:
    "https://res.cloudinary.com/dohehigsm/image/upload/v1782914353/Contacts_wloedk.png"
} as const;

export function getSiteUrl(): URL {
  const configuredUrl = import.meta.env.PUBLIC_SITE_URL || siteConfig.defaultUrl;
  return new URL(configuredUrl);
}

