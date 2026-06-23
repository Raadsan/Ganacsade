import { Toaster } from "sonner"
import { ThemeToggle } from "@/components/website/theme-toggle"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      {children}
      <Toaster richColors position="top-right" />
    </>
  )
}
