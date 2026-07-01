import type { APIRoute } from "astro";
import { getSiteUrl } from "@/config/site";

export const prerender = true;

export const GET: APIRoute = () => {
  const siteUrl = getSiteUrl();
  const urls = [new URL("/", siteUrl).href, new URL("/privacy/", siteUrl).href];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url}</loc></url>`).join("\n")}
</urlset>`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" }
  });
};

