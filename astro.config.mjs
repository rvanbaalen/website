import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
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

// Legacy URLs that still earn search impressions. Historically projects lived at
// /<slug> and the election site at /curacao-election-2025/<lang>; both moved without
// redirects, so Search Console shows ~85% of lifetime impressions hitting 404s.
// Keys are non-slash only — trailingSlash: "never" makes /foo/ and /foo the same
// route, so declaring both is a router collision. The trailing-slash variants are
// appended to _redirects by trailingSlashRedirects() below.
const redirects = {
  "/projects": "/open-source",
  "/debt-tracker": "https://debt-tracker.robinvanbaalen.nl",
  "/flow-invoice": "https://flow-invoice.robinvanbaalen.nl",
  "/json-beautify": "https://json-beautify.robinvanbaalen.nl",
  "/revenue-forecast": "https://revenue-forecast.robinvanbaalen.nl",

  // Election site — moved to its own subdomain, language variants included
  "/curacao-election-2025": "https://curacao-election-2025.robinvanbaalen.nl",
  "/curacao-election-2025/en": "https://curacao-election-2025.robinvanbaalen.nl/en/",
  "/curacao-election-2025/es": "https://curacao-election-2025.robinvanbaalen.nl/es/",
  "/curacao-election-2025/pa": "https://curacao-election-2025.robinvanbaalen.nl/pa/",

  // Projects — moved from /<slug> to /projects/<slug>
  "/domjs": "/projects/domjs",
  "/eslint-config": "/projects/eslint-config",
  "/hashparser": "/projects/hashparser",
  "/readme-to-html": "/projects/readme-to-html",
  "/runner-manager": "/projects/runner-manager",
  "/source-to-llm": "/projects/source-to-llm",
  "/transitionjs": "/projects/transitionjs",

  // Archived projects — no detail page, listed on the archive
  "/custom-scroll": "/open-source/archive",
  "/portals": "/open-source/archive",
  "/signals": "/open-source/archive",
};

// Cloudflare matches _redirects paths exactly, and Astro refuses to declare /foo and
// /foo/ as separate routes. Google indexed the trailing-slash forms, so emit a 301 for
// every /foo/ — both for the redirects above and for each real page, which Cloudflare
// would otherwise normalize with a temporary 307.
function trailingSlashRedirects() {
  return {
    name: "trailing-slash-redirects",
    hooks: {
      "astro:build:done": ({ dir, pages, logger }) => {
        const file = new URL("_redirects", dir);
        if (!existsSync(file)) {
          throw new Error(`_redirects not found at ${file.pathname} — cannot add trailing-slash rules`);
        }

        const targets = new Map();
        for (const [from, to] of Object.entries(redirects)) targets.set(from, to);
        for (const { pathname } of pages) {
          const path = `/${pathname.replace(/\/$/, "")}`;
          if (path !== "/" && !targets.has(path)) targets.set(path, path);
        }

        const rules = [...targets].map(([from, to]) => `${from}/  ${to}  301`);
        const existing = readFileSync(file, "utf-8").trimEnd();
        writeFileSync(file, `${existing}\n${rules.join("\n")}\n`);
        logger.info(`Added ${rules.length} trailing-slash redirects to _redirects`);
      },
    },
  };
}

export default defineConfig({
  site: "https://robinvanbaalen.nl",
  trailingSlash: "never",

  build: {
    format: "file",
  },

  redirects,

  integrations: [
    mdx(),
    trailingSlashRedirects(),
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
