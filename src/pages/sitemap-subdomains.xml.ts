import { getCollection } from "astro:content";

/**
 * Sitemap of project sites hosted on robinvanbaalen.nl subdomains, so they
 * count as submitted under the Search Console domain property. Derived
 * from the `url` field of the projects collection.
 */
export async function GET() {
  const projects = await getCollection("projects");
  const locs = [
    ...new Set(
      projects
        .map(({ data }) => data.url)
        .filter((url): url is string => !!url && /^https:\/\/[a-z0-9-]+\.robinvanbaalen\.nl\/?$/.test(url))
        .map((url) => (url.endsWith("/") ? url : `${url}/`)),
    ),
  ].sort();

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${locs.map((loc) => `  <url><loc>${loc}</loc></url>`).join("\n")}
</urlset>
`;

  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
