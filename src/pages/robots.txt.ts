import type { APIRoute } from "astro";
import { getSiteUrl } from "@/config/site";

export const prerender = true;

export const GET: APIRoute = () => {
  const siteUrl = getSiteUrl();
  const body = [
    "User-agent: *",
    "Allow: /",
    `Sitemap: ${new URL("/sitemap.xml", siteUrl).href}`,
    ""
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" }
  });
};

