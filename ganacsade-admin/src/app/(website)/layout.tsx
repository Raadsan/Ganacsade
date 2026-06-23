import type { Metadata } from "next"
import { Toaster } from "sonner"
import { SiteHeader } from "@/components/website/site-header"
import { SiteFooter } from "@/components/website/site-footer"

export const metadata: Metadata = {
  title: {
    default: "GANACSADE — Shop, Deliver, Grow",
    template: "%s | GANACSADE",
  },
  description: "GANACSADE e-commerce platform — online shopping, delivery, and business services.",
}

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <Toaster richColors position="top-right" />
    </div>
  )
}
