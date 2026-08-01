const SITE_URL = "https://robinvanbaalen.nl";
const PERSON_ID = `${SITE_URL}/#person`;

/**
 * With `build.format: "file"`, Astro.url.pathname is "/page.html" at build time.
 * Public-facing URLs (canonical, og:url, JSON-LD) must be extensionless.
 */
export function normalizePath(pathname: string): string {
  const path = pathname.replace(/\.html$/, "");
  return path === "/index" || path === "" ? "/" : path;
}

export const SITE_NAME = "Robin van Baalen";
export const SOCIAL_LINKS = {
  github: "https://github.com/rvanbaalen",
  linkedin: "https://www.linkedin.com/in/robinvanbaalen/",
};

export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: "Robin van Baalen",
    url: SITE_URL,
    jobTitle: "Founder & Software Engineer",
    image: `${SITE_URL}/images/avatar.png`,
    sameAs: [SOCIAL_LINKS.github, SOCIAL_LINKS.linkedin],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { "@id": PERSON_ID },
  };
}

interface ArticleInput {
  title: string;
  description: string;
  date: Date;
  updatedDate?: Date;
  tags: string[];
  url: string;
  image?: string;
}

export function blogPostingSchema(article: ArticleInput) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.description,
    datePublished: article.date.toISOString(),
    ...(article.updatedDate && { dateModified: article.updatedDate.toISOString() }),
    keywords: article.tags.join(", "),
    url: article.url,
    ...(article.image && { image: article.image }),
    author: { "@id": PERSON_ID },
  };
}

interface ProjectInput {
  name: string;
  description: string;
  repo: string;
  tech?: string[];
  version?: string;
  url: string;
}

export function softwareSourceCodeSchema(project: ProjectInput) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: project.name,
    description: project.description,
    codeRepository: project.repo.startsWith("http")
      ? project.repo
      : `https://github.com/${project.repo}`,
    ...(project.tech?.length && { programmingLanguage: project.tech[0] }),
    ...(project.version && { version: project.version }),
    url: project.url,
    author: { "@id": PERSON_ID },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: new URL(item.path, SITE_URL).href,
    })),
  };
}
