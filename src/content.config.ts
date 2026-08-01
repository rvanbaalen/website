import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const articles = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/articles" }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(160),
    date: z.date(),
    updatedDate: z.date().optional(),
    tags: z.array(z.string()),
    ogImage: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/projects" }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    url: z.string().optional(),
    repo: z.string(),
    tech: z.array(z.string()),
    category: z.enum(["standalone", "package", "template", "cli"]),
    featured: z.boolean().default(false),
    archived: z.boolean().default(false),
    order: z.number().default(0),
    hover_detail: z.string().optional(),
  }),
});

const skills = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/skills" }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    version: z.string(),
    author: z.string(),
    invoke: z.string().optional(),
    trigger: z.enum(["manual", "auto"]).default("manual"),
    category: z.enum(["skill", "agent"]).default("skill"),
    order: z.number().default(0),
  }),
});

export const collections = { articles, projects, skills };
