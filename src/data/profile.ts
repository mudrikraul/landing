import type { Certificate, TrustBenefit } from "@/types/site";

export const aboutFacts = [
  "7 лет наставничества и коучинга",
  "3000+ клиентов и учеников по всему миру",
  "Эффективный опыт работы с выгоранием, тревогой, самосаботажем и кризисными периодами",
  "12 лет практики в фитнесе и плавании",
  "10 лет профессионального спорта",
  "Коучинг — школа IPACT",
  "Международная сертификация"
] as const;

export const certificates: readonly Certificate[] = [
  { title: "Белый сертификат по коучингу", image: "https://res.cloudinary.com/dohehigsm/image/upload/v1777399344/sert1_sahwgd.webp" },
  { title: "Желтый международный сертификат", image: "https://res.cloudinary.com/dohehigsm/image/upload/v1777399344/sert2_zmchgs.webp" },
  { title: "Оранжевый сертификат профессионального коуча", image: "https://res.cloudinary.com/dohehigsm/image/upload/v1777399344/sert3_selhkn.webp" }
];

export const trustBenefits: readonly TrustBenefit[] = [
  { title: "Ясность", text: "что важно именно Вам и куда двигаться" },
  { title: "Опора", text: "устойчивое состояние без внутренней гонки" },
  { title: "Система", text: "понятные шаги, которые реально выполняются" },
  { title: "Закрепление", text: "чтобы изменения стали нормой, а не вспышкой" }
];

export const trustCopy = [
  "Я сочетаю коучинг, наставничество и тренерскую дисциплину: мягко по отношению к человеку, жёстко по отношению к хаосу.",
  "Мы не «говорим годами», мы выстраиваем систему, которая поддерживает Вас каждый день.",
  "Если Вы хотите вернуть ясность, устойчивость и внутреннюю силу, буду рад помочь."
] as const;
