import type { MethodLink, NavItem, SocialLink } from "@/types/site";

export const navigation: readonly NavItem[] = [
  { label: "Обо мне", href: "#about" },
  { label: "Методика", href: "#method" },
  { label: "Результаты", href: "#trust" },
  { label: "Галерея", href: "#gallery" },
  { label: "Контакты", href: "#contacts" }
];

export const socialLinks: readonly SocialLink[] = [
  { label: "Instagram", icon: "instagram" },
  { label: "Telegram", icon: "telegram" },
  { label: "YouTube", icon: "youtube" }
];

export const methodLinks: readonly MethodLink[] = [
  { label: "Внутренний компас", target: "#compass", desktopColumn: "left", desktopRow: 1, mobileOrder: 1 },
  { label: "Персональная система продуктивности", target: "#productivity", desktopColumn: "left", desktopRow: 2, mobileOrder: 2 },
  { label: "Система саморегуляции. Эмоциональный баланс", target: "#balance", desktopColumn: "left", desktopRow: 3, mobileOrder: 4 },
  { label: "Система внутренней силы", target: "#strength", desktopColumn: "right", desktopRow: 1, mobileOrder: 3 },
  { label: "Омоложение организма", target: "#rejuvenation", desktopColumn: "right", desktopRow: 2, mobileOrder: 5 }
];

