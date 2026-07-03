import type { APIRoute } from "astro";
import { getSiteUrl } from "@/config/site";
import { seoRoutes } from "@/config/seo";

export const prerender = true;

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export const GET: APIRoute = () => {
  const siteUrl = getSiteUrl();
  const urls = seoRoutes
    .filter((route) => !route.seo.noindex)
    .map((route) => ({
      loc: new URL(route.seo.canonicalPath, siteUrl).href,
      changeFrequency: route.changeFrequency,
      priority: route.priority
    }));
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => [
  "  <url>",
  `    <loc>${escapeXml(url.loc)}</loc>`,
  `    <changefreq>${url.changeFrequency}</changefreq>`,
  `    <priority>${url.priority.toFixed(1)}</priority>`,
  "  </url>"
].join("\n")).join("\n")}
</urlset>`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" }
  });
};
