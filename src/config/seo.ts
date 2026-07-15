import type { SeoConfig } from "@/types/site";
import { siteConfig } from "./site";

export const homeSeo: SeoConfig = {
  title: "RMFlow — The way to yourself",
  description: siteConfig.description,
  canonicalPath: "/",
  image: "https://res.cloudinary.com/dohehigsm/image/upload/v1783415638/OG_qcxfmh.png",
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

export const infoSeo: SeoConfig = {
  title: "Оставить заявку — RMFlow",
  description: "Оставьте контактные данные, и команда RMFlow свяжется с вами в ближайшее время.",
  canonicalPath: "/info/",
  noindex: true,
  type: "website",
  structuredData: "website"
};

export const seoRoutes = [
  { seo: homeSeo, changeFrequency: "monthly", priority: 1 },
  { seo: privacySeo, changeFrequency: "yearly", priority: 0.2 }
] as const;
