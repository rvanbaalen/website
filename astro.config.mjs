import { readdirSync, readFileSync } from "node:fs";
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import posthog from "astro-posthog";

import cloudflare from "@astrojs/cloudflare";

if (!process.env.POSTHOG_TOKEN) {
  console.warn("[build] POSTHOG_TOKEN not set — PostHog analytics disabled for this build");
}

// astro:content can't be imported here, so read article dates straight from frontmatter
function articleLastmodMap() {
  const map = new Map();
  try {
    for (const file of readdirSync("./src/content/articles")) {
      if (!/\.mdx?$/.test(file)) continue;
      const source = readFileSync(`./src/content/articles/${file}`, "utf-8");
      const date =
        source.match(/^updatedDate:\s*(\S+)/m)?.[1] ?? source.match(/^date:\s*(\S+)/m)?.[1];
      if (date) map.set(file.replace(/\.mdx?$/, ""), new Date(date));
    }
  } catch {
    // no articles directory yet
  }
  return map;
}
const articleDates = articleLastmodMap();

export default defineConfig({
  site: "https://robinvanbaalen.nl",
  trailingSlash: "never",

  build: {
    format: "file",
  },

  redirects: {
    "/projects": "/open-source",
    "/curacao-election-2025": "https://curacao-election-2025.robinvanbaalen.nl",
    "/debt-tracker": "https://debt-tracker.robinvanbaalen.nl",
    "/flow-invoice": "https://flow-invoice.robinvanbaalen.nl",
    "/json-beautify": "https://json-beautify.robinvanbaalen.nl",
    "/revenue-forecast": "https://revenue-forecast.robinvanbaalen.nl",
  },

  integrations: [
    mdx(),
    sitemap({
      serialize(item) {
        const slug = item.url.match(/\/writing\/([^/]+?)\/?$/)?.[1];
        const lastmod = slug && articleDates.get(slug);
        if (lastmod) item.lastmod = lastmod.toISOString();
        return item;
      },
    }),
    ...(process.env.POSTHOG_TOKEN
      ? [
          posthog({
            posthogKey: process.env.POSTHOG_TOKEN,
            api_host: "https://eu.i.posthog.com",
            defaults: "2025-05-24",
          }),
        ]
      : []),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: cloudflare({
    imageService: "compile",
    // astro-og-canvas (CanvasKit WASM) cannot run inside the workerd prerenderer
    prerenderEnvironment: "node",
  }),
});
