import { execFileSync } from "node:child_process";
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

// Last commit date per tracked file, from a single git pass. Used for sitemap
// <lastmod> so crawlers get a real modification date rather than the build time.
// Returns an empty map when git is unavailable or the clone is shallow — an absent
// lastmod is better than a wrong one, which Google learns to distrust.
function gitLastModifiedMap() {
  const map = new Map();
  try {
    const log = execFileSync("git", ["log", "--format=%cI", "--name-only", "--no-merges"], {
      encoding: "utf-8",
      maxBuffer: 32 * 1024 * 1024,
    });
    let date = null;
    for (const line of log.split("\n")) {
      if (line === "") continue;
      if (/^\d{4}-\d{2}-\d{2}T/.test(line)) date = line;
      else if (date && !map.has(line)) map.set(line, date);
    }
  } catch {
    console.warn("[build] git log unavailable — sitemap will omit lastmod");
  }
  return map;
}
const gitDates = gitLastModifiedMap();

// Map a built URL back to the source file it came from, so lastmod tracks content.
function sourceFileForPath(path) {
  const seg = path.replace(/^\/|\/$/g, "");
  if (seg === "") return "src/pages/index.astro";
  for (const candidate of [
    `src/pages/${seg}.astro`,
    `src/pages/${seg}.mdx`,
    `src/pages/${seg}/index.astro`,
  ]) {
    if (gitDates.has(candidate)) return candidate;
  }
  return null;
}

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
        const path = new URL(item.url).pathname;

        // Articles carry an explicit date in frontmatter; everything else falls
        // back to the last commit that touched its source file
        const slug = path.match(/\/writing\/([^/]+?)\/?$/)?.[1];
        const articleDate = slug && articleDates.get(slug);
        if (articleDate) {
          item.lastmod = articleDate.toISOString();
        } else {
          const source = sourceFileForPath(path);
          const committed = source && gitDates.get(source);
          if (committed) item.lastmod = committed;
        }
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

  // Every page is prerendered, so images can be optimized with sharp at build time
  // and no runtime image service is needed. The adapter's default workerd service
  // requires a Cloudflare Images binding we don't have, and silently passes images
  // through unresized when it is missing.
  image: {
    service: { entrypoint: "astro/assets/services/sharp" },
  },

  adapter: cloudflare({
    imageService: "custom",
    // astro-og-canvas (CanvasKit WASM) cannot run inside the workerd prerenderer
    prerenderEnvironment: "node",
  }),
});
