import { SiteHeader } from "@/components/website/site-header"
import { SiteFooter } from "@/components/website/site-footer"
import { CustomerAuthGuard } from "@/components/customer/customer-auth-guard"
import { Toaster } from "sonner"

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <CustomerAuthGuard>{children}</CustomerAuthGuard>
      </main>
      <SiteFooter />
      <Toaster richColors position="top-right" />
    </div>
  )
}
