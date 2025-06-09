"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Share2, Twitter, Facebook, Linkedin, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type SocialShareButtonsProps = {
  url: string
  title: string
  excerpt: string
}

export default function SocialShareButtons({ url, title, excerpt }: SocialShareButtonsProps) {
  const { toast } = useToast()

  // Ensure we have the full URL
  const fullUrl = url.startsWith("http")
    ? url
    : `${process.env.NEXT_PUBLIC_SITE_URL || "https://blog.ongoro.top"}${url}`

  // Prepare sharing URLs
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(fullUrl)}`
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title} - ${fullUrl}`)}`

  const handleShare = (platform: string, shareUrl: string) => {
    window.open(shareUrl, `share-${platform}`, "width=600,height=400")
  }

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(fullUrl)
      .then(() => {
        toast({
          title: "Link copied!",
          description: "The post URL has been copied to your clipboard",
        })
      })
      .catch(() => {
        toast({
          title: "Failed to copy",
          description: "Could not copy the link to clipboard",
          variant: "destructive",
        })
      })
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Share:</span>

      <Button
        variant="ghost"
        size="icon"
        className="rounded-full h-8 w-8"
        onClick={() => handleShare("twitter", twitterUrl)}
        aria-label="Share on Twitter"
      >
        <Twitter className="h-4 w-4 text-[#1DA1F2]" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="rounded-full h-8 w-8"
        onClick={() => handleShare("facebook", facebookUrl)}
        aria-label="Share on Facebook"
      >
        <Facebook className="h-4 w-4 text-[#4267B2]" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="rounded-full h-8 w-8"
        onClick={() => handleShare("linkedin", linkedinUrl)}
        aria-label="Share on LinkedIn"
      >
        <Linkedin className="h-4 w-4 text-[#0077B5]" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="rounded-full h-8 w-8"
        onClick={() => handleShare("whatsapp", whatsappUrl)}
        aria-label="Share on WhatsApp"
      >
        <Send className="h-4 w-4 text-[#25D366]" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
            <Share2 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={copyToClipboard}>Copy link</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
