import type { Metadata } from "next"
import { Card } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "About",
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold">About GANACSADE</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            We build technology that makes commerce simple for everyone.
          </p>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold">Our Mission</h2>
          <p className="mt-3 text-muted-foreground">
            GANACSADE makes online shopping easy for customers in Somalia — from
            browsing products to paying with mobile money and tracking delivery.
          </p>
        </Card>

        <div className="grid gap-6 sm:grid-cols-2">
          <Card className="p-6">
            <h3 className="font-semibold">For Customers</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Shop products, manage wishlist and addresses, buy data packages,
              pay securely, and track orders. Login on the website to see purchases.
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold">Behind the Scenes</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Admin staff manage inventory, orders, delivery users, payments,
              and store settings — customers only see their own order history.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
