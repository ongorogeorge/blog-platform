import { ImageResponse } from "next/og"

export const runtime = "edge"

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

export default async function Image({ params }: { params: { category: string; slug: string } }) {
  // Create a simple OG image using just the params
  const title = params.slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  const category = params.category.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())

  return new ImageResponse(
    <div
      style={{
        fontSize: 48,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        padding: "40px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "24px", marginBottom: "20px", opacity: 0.9 }}>{category}</div>
      <div
        style={{
          fontSize: "48px",
          fontWeight: "bold",
          lineHeight: 1.2,
          maxWidth: "80%",
          textAlign: "center",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: "24px",
          marginTop: "30px",
          opacity: 0.9,
        }}
      >
        George Ongoro Blog
      </div>
    </div>,
    { ...size },
  )
}
