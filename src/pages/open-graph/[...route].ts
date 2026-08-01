import { getCollection } from "astro:content";
import { OGImageRoute } from "astro-og-canvas";

const articles = await getCollection("articles", ({ data }) => !data.draft);

const pages = Object.fromEntries(
  articles.map((article) => [
    `writing/${article.id}`,
    { title: article.data.title, description: article.data.description },
  ]),
);

const { getStaticPaths, GET } = await OGImageRoute({
  pages,
  getImageOptions: (_path, page: (typeof pages)[string]) => ({
    title: page.title,
    description: page.description,
    bgGradient: [[13, 13, 18]] as [number, number, number][],
    padding: 96,
    font: {
      title: {
        families: ["Lora"],
        color: [234, 230, 220] as [number, number, number],
        size: 72,
        lineHeight: 1.2,
      },
      description: {
        families: ["DM Sans"],
        color: [154, 160, 173] as [number, number, number],
        size: 32,
        lineHeight: 1.5,
      },
    },
    fonts: ["./src/assets/fonts/lora-variable.ttf", "./src/assets/fonts/dm-sans-variable.ttf"],
  }),
});

export { getStaticPaths, GET };
