import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import posthog from "astro-posthog";

import cloudflare from "@astrojs/cloudflare";

if (!process.env.POSTHOG_TOKEN) {
  console.warn("[build] POSTHOG_TOKEN not set — PostHog analytics disabled for this build");
}

export default defineConfig({
  site: "https://robinvanbaalen.nl",

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
    sitemap(),
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
  })
});