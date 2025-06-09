import type { Metadata } from "next"

type SEOProps = {
  title: string
  description: string
  url: string
  ogImage?: string
  type?: string
  publishedAt?: string
  updatedAt?: string
}

export function generateMetadata({
  title,
  description,
  url,
  ogImage,
  type = "article",
  publishedAt,
  updatedAt,
}: SEOProps): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "George Ongoro Blog",
      images: [
        {
          url: ogImage || "/default-og-image.jpg",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "en_US",
      type,
      ...(publishedAt && { publishedTime: publishedAt }),
      ...(updatedAt && { modifiedTime: updatedAt }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage || "/default-og-image.jpg"],
      creator: "@georgeongoro",
    },
    alternates: {
      canonical: url,
    },
  }
}
