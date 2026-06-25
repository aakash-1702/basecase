import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL.replace(/\/$/, "");

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/problems`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${base}/sheets`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${base}/roadmap`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.75,
    },
    {
      url: `${base}/interview`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  const [problems, sheets] = await Promise.all([
    prisma.problem.findMany({
      where: { isPublic: true, isActive: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.sheet.findMany({
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const problemRoutes: MetadataRoute.Sitemap = problems.map((problem) => ({
    url: `${base}/problems/${problem.slug}`,
    lastModified: problem.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const sheetRoutes: MetadataRoute.Sitemap = sheets.map((sheet) => ({
    url: `${base}/sheets/${sheet.slug}`,
    lastModified: sheet.updatedAt,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  return [...staticRoutes, ...problemRoutes, ...sheetRoutes];
}
