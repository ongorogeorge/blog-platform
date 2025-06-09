import Link from "next/link"
import NewsletterSubscription from "@/components/newsletter/newsletter-subscription"
import CookiePreferencesModal from "@/components/cookie-consent/cookie-preferences-modal"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t py-12 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">George Ongoro</h3>
            <p className="text-muted-foreground">Personal blog sharing insights on various topics.</p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Connect</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://twitter.com/georgeongoro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com/in/georgeongoro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/georgeongoro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          <div>
            <NewsletterSubscription />
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-muted-foreground">
          <p>&copy; {currentYear} George Ongoro. All rights reserved.</p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Link href="/privacy-policy" className="hover:text-primary transition-colors text-sm">
              Privacy Policy
            </Link>
            <Link href="/cookie-policy" className="hover:text-primary transition-colors text-sm">
              Cookie Policy
            </Link>
            <CookiePreferencesModal>
              <button className="hover:text-primary transition-colors text-sm underline">Cookie Preferences</button>
            </CookiePreferencesModal>
          </div>
        </div>
      </div>
    </footer>
  )
}
