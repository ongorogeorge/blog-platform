import type { Metadata } from "next"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about George Ongoro and this blog",
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">About George Ongoro</h1>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-lg mb-6">
                Welcome to my personal blog! I'm George Ongoro, and this is where I share my thoughts, experiences, and
                insights on various topics that interest me.
              </p>

              <h2 className="text-2xl font-semibold mb-4">What You'll Find Here</h2>
              <p className="mb-4">
                This blog covers a wide range of topics including technology, programming, personal development, and
                life experiences. I believe in sharing knowledge and learning from the community.
              </p>

              <h2 className="text-2xl font-semibold mb-4">My Mission</h2>
              <p className="mb-4">
                My goal is to create content that is both informative and engaging. Whether you're here to learn
                something new, get inspired, or just enjoy a good read, I hope you find value in what I share.
              </p>

              <h2 className="text-2xl font-semibold mb-4">Get In Touch</h2>
              <p className="mb-4">
                I love connecting with readers and fellow enthusiasts. Feel free to reach out through the contact page
                or subscribe to the newsletter to stay updated with new posts.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
