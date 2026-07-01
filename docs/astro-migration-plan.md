# План переноса RMFlow в Astro

## Цель

Перенести монолитный `index.html` в Astro-приложение для Cloudflare Workers. Основной контент должен быть статически сгенерирован и доступен поисковым системам без JavaScript. Клиентский JavaScript используется только для меню, галереи, диалогов, scroll spy и формы заявки.

## Архитектурные решения

- Astro без React и глобального client store.
- `/` и `/privacy/` генерируются статически.
- `POST /api/leads` выполняется на Cloudflare Workers.
- Telegram Bot API вызывается только с сервера.
- Turnstile и honeypot защищают форму от автоматического спама.
- Контент хранится в типизированных TypeScript-модулях.
- Исходный файл сохраняется без изменений как `legacy/index.html` до подтверждения визуального паритета. Перенос из корня необходим, чтобы Vite не перехватывал Astro route `/`.

## Этапы

1. Создать Astro/Cloudflare scaffold, строгий TypeScript и env examples.
2. Перенести контент в `src/data`, а metadata — в `src/config`.
3. Создать семантические Astro-компоненты всех секций.
4. Перенести визуальные токены и responsive-поведение.
5. Реализовать доступные меню, gallery/media dialog и lead dialog.
6. Реализовать серверную валидацию, Turnstile и Telegram `sendMessage`.
7. Добавить `/privacy/`, `robots.txt`, `sitemap.xml` и canonical/OG metadata.
8. Выполнить type check, production build и browser QA на mobile/desktop.
9. Обновить `.agents/project/**` по фактической структуре.

## Компонентные границы

- `BaseLayout` — документ, metadata, canonical, Open Graph, JSON-LD и global styles.
- `SiteHeader`, `SideMenu`, `FloatingLeadButton` — глобальная навигация и CTA.
- `HeroSection`, `GallerySection`, `MethodSection`, `ProgramsSection`, `AboutSection`, `TrustSection`, `ContactsSection` — статические секции страницы.
- `GalleryCard`, `GalleryControls`, `MediaDialog` — галерея и отложенная загрузка YouTube.
- `LeadDialog`, `LeadForm`, `TurnstileWidget` — состояния формы и согласие.
- Feature-контроллеры — изолированная DOM-интерактивность без React hooks.

## API-контракт

`POST /api/leads` принимает JSON:

```ts
interface LeadRequest {
  name: string;
  phone: string;
  consent: true;
  company: string;
  turnstileToken: string;
}
```

Endpoint проверяет content type, размер запроса, длину имени, телефон с 10–15 цифрами, согласие, пустой honeypot и Turnstile token. После успешной проверки отправляется plain-text сообщение в Telegram.

## Секреты

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `TURNSTILE_SECRET_KEY`

Публичные значения:

- `PUBLIC_SITE_URL`
- `PUBLIC_TURNSTILE_SITE_KEY`

Реальные секреты не хранятся в репозитории и настраиваются через Cloudflare.

## SEO checklist

- Один индексируемый `h1`.
- Полный текст программ присутствует в built HTML.
- Уникальные title/description для `/` и `/privacy/`.
- Абсолютный canonical, Open Graph и Twitter Card.
- `robots.txt` и `sitemap.xml` содержат production URL.
- Нет `href="#"` и неподтверждённой structured data.
- Изображения имеют размеры, `alt`, lazy loading; hero получает высокий приоритет.

## Release blockers

- Заменить placeholder-сертификаты и временные изображения.
- Указать реальные social/contact URLs.
- Указать production domain и финальное OG image.
- Предоставить и утвердить юридический текст `/privacy/`.
- Настроить Telegram и Turnstile secrets.

## Проверка

- `npm run check`
- `npm run build`
- Проверка built HTML на наличие контента и одного `h1`.
- Browser QA: 375×812, 390×844, 768×1024, 1024×768, 1440×1024 и 1920px+.
- Keyboard QA: Tab, Shift+Tab, Escape, возврат focus.
- Форма: invalid fields, unchecked consent, honeypot, Turnstile failure, Telegram failure, success, retry и двойной submit.
