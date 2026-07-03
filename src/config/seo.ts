import type { SeoConfig } from "@/types/site";
import { siteConfig } from "./site";

export const homeSeo: SeoConfig = {
  title: "RMFlow — The way to yourself",
  description: siteConfig.description,
  canonicalPath: "/",
  image: siteConfig.heroImage,
  imageAlt: "Рауль Мудрик и авторские программы RMFlow",
  type: "website",
  structuredData: "home"
};

export const privacySeo: SeoConfig = {
  title: "Политика конфиденциальности — RMFlow",
  description: "Правила обработки персональных данных при отправке заявки на сайте RMFlow.",
  canonicalPath: "/privacy/",
  type: "website",
  structuredData: "website"
};

export const seoRoutes = [
  { seo: homeSeo, changeFrequency: "monthly", priority: 1 },
  { seo: privacySeo, changeFrequency: "yearly", priority: 0.2 }
] as const;
