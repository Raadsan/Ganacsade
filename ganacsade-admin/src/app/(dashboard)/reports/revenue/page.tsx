"use client"

import { useEffect, useState, useCallback } from "react"
import { transactionsApi, Transaction, TransactionStats } from "@/lib/api/transactions"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Download, DollarSign, TrendingUp, TrendingDown, CreditCard } from "lucide-react"
import { toast } from "sonner"

const STATUS_VARIANT: Record<string, string> = {
  completed: "success",
  pending: "secondary",
  failed: "destructive",
  cancelled: "outline",
  refunded: "warning",
}

export default function RevenueReportPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState<TransactionStats | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [txRes, statRes] = await Promise.all([
        transactionsApi.getTransactions({ limit: 100 }),
        transactionsApi.getStats(),
      ])
      const txData = (txRes as any)?.data || txRes
      setTransactions(Array.isArray(txData) ? txData : [])
      const statData = (statRes as any)?.data || statRes
      setStats(statData || null)
    } catch {
      toast.error("Failed to load revenue data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleExport = () => {
    if (!transactions.length) { toast.error("No data to export"); return }
    const rows = transactions.map((t) => ({
      "Transaction ID": t.transaction_id,
      Type: t.type,
      Status: t.status,
      Amount: t.amount,
      Currency: t.currency,
      "Payment Method": t.payment_method,
      User: t.user_name || t.user_email || t.user_id,
      Date: new Date(t.created_at).toLocaleDateString(),
    }))
    const headers = Object.keys(rows[0])
    const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => `"${String(r[h as keyof typeof r] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = `revenue-report-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const statCards = [
    { label: "Total Revenue", value: stats ? `$${Number(stats.total_revenue).toLocaleString()}` : "—", icon: DollarSign },
    { label: "Net Revenue", value: stats ? `$${Number(stats.net_revenue).toLocaleString()}` : "—", icon: TrendingUp },
    { label: "Total Refunds", value: stats ? `$${Number(stats.total_refunds).toLocaleString()}` : "—", icon: TrendingDown },
    { label: "Transactions", value: stats?.total_transactions ?? "—", icon: CreditCard },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Revenue &amp; Transactions</h1>
          <p className="text-muted-foreground">Payment transactions, revenue and refund overview.</p>
        </div>
        <Button onClick={handleExport} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label} className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold">{loading ? "…" : s.value}</p>
            </Card>
          )
        })}
      </div>

      <Card>
        <div className="px-5 pt-5 pb-3 border-b">
          <h2 className="font-semibold text-lg">Transaction Details</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">Loading…</TableCell></TableRow>
            ) : transactions.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">No transactions found.</TableCell></TableRow>
            ) : (
              transactions.slice(0, 50).map((t, idx) => (
                <TableRow key={t.id || idx}>
                  <TableCell className="font-mono text-xs">{t.transaction_id}</TableCell>
                  <TableCell className="capitalize">{t.type?.replace(/_/g, " ") || "—"}</TableCell>
                  <TableCell className="capitalize text-sm">{t.payment_method?.replace(/_/g, " ") || "—"}</TableCell>
                  <TableCell className="font-semibold">${Number(t.amount).toLocaleString()} {t.currency}</TableCell>
                  <TableCell>
                    <Badge variant={(STATUS_VARIANT[t.status] as any) || "outline"}>{t.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {t.created_at ? new Date(t.created_at).toLocaleDateString() : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
