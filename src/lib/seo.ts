import type { Metadata } from "next";
import { config } from "../data/config";

export const publicPages = {
  "/": {
    title: config.title,
    description:
      "Explore the portfolio of Shiva Sai Thota, a software engineer specializing in full-stack development, Next.js, Python, SaaS applications, AI-powered systems, and modern web technologies.",
  },
  "/about": {
    title: "About Shiva Sai Thota | Software Engineer",
    description:
      "Learn about Shiva Sai Thota’s software engineering background, education, technical skills, and work building full-stack SaaS, AI research tools, and Web3 applications.",
  },
  "/projects": {
    title: "Projects | Shiva Sai Thota — SaaS, AI & Web3",
    description:
      "Explore Crebry, Edith, Decentralized Stablecoin, and freelance websites for Bhagyashree Ventures and GreenCost, built by Shiva Sai Thota.",
  },
  "/contact": {
    title: "Contact Shiva Sai Thota | Software Engineering & Freelance Work",
    description:
      "Contact Shiva Sai Thota for software engineering opportunities, freelance development, and collaborations on full-stack applications, AI systems, and Web3 projects.",
  },
} as const;

export function pageMetadata(path: keyof typeof publicPages): Metadata {
  const { title, description } = publicPages[path];
  const url = new URL(path, config.site).href;
  const images = [
    {
      url: `${config.site}/opengraph-image`,
      width: 1200,
      height: 630,
      alt: "Shiva Sai Thota — Software Engineer, Full-stack SaaS, Agentic AI and Web3",
    },
  ];
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Shiva Sai Thota",
      type: "website",
      locale: "en_IN",
      images,
    },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

export function portfolioSchema() {
  const personId = `${config.site}/#person`;
  const websiteId = `${config.site}/#website`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": personId,
        name: config.author,
        url: `${config.site}/`,
        jobTitle: config.role,
        image: `${config.site}/assets/profile/shiva-sai-thota.png`,
        sameAs: [config.social.github, config.social.linkedin],
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: `${config.site}/`,
        name: "Shiva Sai Thota — Portfolio",
        inLanguage: "en",
        publisher: { "@id": personId },
      },
    ],
  };
}

export const profileSchema = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": `${config.site}/about#profile`,
  url: `${config.site}/about`,
  name: publicPages["/about"].title,
  mainEntity: { "@id": `${config.site}/#person` },
  isPartOf: { "@id": `${config.site}/#website` },
};
