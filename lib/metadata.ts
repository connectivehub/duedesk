import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/config/site";

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  /** Full document title. Skips the layout template. */
  absoluteTitle?: string;
  noindex?: boolean;
  twitterCard?: "summary" | "summary_large_image";
};

export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle,
  noindex = false,
  twitterCard = "summary_large_image",
}: PageMetaInput): Metadata {
  const url = `${SITE_URL}${path === "/" ? "" : path}`;
  const fullTitle =
    absoluteTitle ??
    (path === "/" ? `${SITE_NAME} | Urgent company paperwork, Singapore` : `${title} | ${SITE_NAME}`);

  return {
    title: { absolute: fullTitle },
    description,
    alternates: {
      canonical: url,
    },
    robots: noindex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_SG",
      type: "website",
      images: [
        {
          url: "/opengraph-image.png",
          width: 1200,
          height: 630,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: twitterCard,
      title: fullTitle,
      description,
      images: twitterCard === "summary_large_image" ? ["/opengraph-image.png"] : undefined,
    },
  };
}
