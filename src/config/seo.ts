import type { SeoConfig } from "@/types/site";
import { siteConfig } from "./site";

export const homeSeo: SeoConfig = {
  title: "RMFlow — The way to yourself",
  description: siteConfig.description,
  canonicalPath: "/",
  image: siteConfig.heroImage
};

export const privacySeo: SeoConfig = {
  title: "Политика конфиденциальности — RMFlow",
  description: "Правила обработки персональных данных при отправке заявки на сайте RMFlow.",
  canonicalPath: "/privacy/"
};

