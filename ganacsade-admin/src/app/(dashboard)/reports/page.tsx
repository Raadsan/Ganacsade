"use client"

import Link from "next/link"
import {
  BarChart3,
  ShoppingCart,
  CreditCard,
  Users,
  Package,
  Truck,
  ArrowRight,
} from "lucide-react"
import { Card } from "@/components/ui/card"

const reportLinks = [
  {
    title: "Sales Report",
    description: "Track daily, weekly, and monthly sales revenue and order volumes.",
    href: "/reports/sales",
    icon: BarChart3,
    colorClass: "text-primary",
    bgClass: "bg-primary/10",
    borderClass: "border-primary",
  },
  {
    title: "Orders Report",
    description: "View order statuses, trends, pending and delivered breakdowns.",
    href: "/reports/orders",
    icon: ShoppingCart,
    colorClass: "text-secondary",
    bgClass: "bg-secondary/10",
    borderClass: "border-secondary",
  },
  {
    title: "Revenue / Transactions",
    description: "Detailed revenue breakdown by payment method and time period.",
    href: "/reports/revenue",
    icon: CreditCard,
    colorClass: "text-primary",
    bgClass: "bg-primary/10",
    borderClass: "border-primary",
  },
  {
    title: "Users Report",
    description: "Customer registrations, activity stats, and role distribution.",
    href: "/reports/users",
    icon: Users,
    colorClass: "text-secondary",
    bgClass: "bg-secondary/10",
    borderClass: "border-secondary",
  },
  {
    title: "Products Report",
    description: "Top-selling products, inventory overview, and category performance.",
    href: "/reports/products",
    icon: Package,
    colorClass: "text-primary",
    bgClass: "bg-primary/10",
    borderClass: "border-primary",
  },
  {
    title: "Delivery Report",
    description: "Delivery performance, delivery-person stats and on-time rates.",
    href: "/reports/delivery",
    icon: Truck,
    colorClass: "text-secondary",
    bgClass: "bg-secondary/10",
    borderClass: "border-secondary",
  },
]

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground mt-1">
          Overview of all available business reports. Click a report to view detailed data.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {reportLinks.map((report) => {
          const Icon = report.icon
          return (
            <Link key={report.href} href={report.href}>
              <Card
                className={`group relative overflow-hidden p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border hover:${report.borderClass}`}
              >
                {/* Accent bar at top */}
                <div
                  className={`absolute top-0 left-0 h-[3px] w-full ${report.bgClass} group-hover:bg-primary transition-all duration-300`}
                  style={{ background: "var(--primary)" }}
                />

                <div className="flex items-start justify-between mt-1">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl mb-4 ${report.bgClass}`}>
                    <Icon className={`h-6 w-6 ${report.colorClass}`} />
                  </div>
                  <ArrowRight
                    className={`h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 ${report.colorClass}`}
                  />
                </div>

                <h3 className="text-lg font-semibold mb-1">{report.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {report.description}
                </p>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
