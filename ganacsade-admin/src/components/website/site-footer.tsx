import Link from "next/link"
import { websiteNav } from "@/lib/website/nav"

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <p className="text-lg font-bold text-primary">GANACSADE</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Your trusted e-commerce platform for products, delivery, and digital services in Somalia.
          </p>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold">Quick Links</p>
          <nav className="flex flex-col gap-2">
            {websiteNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold">Contact</p>
          <p className="text-sm text-muted-foreground">info@ganacsade.com</p>
          <p className="text-sm text-muted-foreground">+252 61 000 0000</p>
          <p className="text-sm text-muted-foreground">Mogadishu, Somalia</p>
        </div>
      </div>

      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} GANACSADE. All rights reserved.
      </div>
    </footer>
  )
}
