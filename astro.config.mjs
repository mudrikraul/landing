import cloudflare from "@astrojs/cloudflare";
import { defineConfig } from "astro/config";

const site = process.env.PUBLIC_SITE_URL || "https://example.com";

export default defineConfig({
  site,
  output: "static",
  adapter: cloudflare({ imageService: "passthrough" }),
  build: {
    assets: "assets"
  },
  vite: {
    build: {
      sourcemap: false
    }
  }
});
