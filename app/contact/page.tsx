import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, MessageSquare, Globe } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with George Ongoro",
}

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Contact Me</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Feel free to reach out via email for any inquiries, collaborations, or just to say hello.
              </p>
              <a href="mailto:gtechong72@gmail.com" className="text-primary hover:underline font-medium">
                gtechong72@gmail.com
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Social Media
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Connect with me on social media platforms for updates and discussions.
              </p>
              <div className="space-y-2">
                <div>
                  <a
                    href="https://twitter.com/georgeongoro"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Twitter
                  </a>
                </div>
                <div>
                  <a
                    href="https://linkedin.com/in/georgeongoro"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    LinkedIn
                  </a>
                </div>
                <div>
                  <a
                    href="https://github.com/georgeongoro"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    GitHub
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              About This Blog
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This blog is built with Next.js, MongoDB, and deployed on Vercel. It features a modern design, SEO
              optimization, and a newsletter subscription system. The source code and more details about the technical
              implementation are available on my GitHub.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
