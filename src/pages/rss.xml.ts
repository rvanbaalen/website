import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const articles = await getCollection("articles", ({ data }) => !data.draft);

  return rss({
    title: "Robin van Baalen",
    description: "Articles about software engineering, architecture, and building products.",
    site: context.site!,
    xmlns: { atom: "http://www.w3.org/2005/Atom" },
    customData: [
      "<language>en</language>",
      `<atom:link href="${new URL("/rss.xml", context.site)}" rel="self" type="application/rss+xml"/>`,
    ].join(""),
    items: articles
      .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
      .map((article) => ({
        title: article.data.title,
        pubDate: article.data.date,
        description: article.data.description,
        link: `/writing/${article.id}`,
      })),
  });
}
