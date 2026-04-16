"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, MoreVertical, Eye, Download, Filter, DollarSign } from "lucide-react"
import { Transaction } from "@/types"
import { TransactionDetailsDialog } from "@/components/dashboard/transaction-details-dialog"
import { exportTransactionsToCSV } from "@/lib/export-transactions"
import { transactionsApi } from "@/lib/api/transactions"
import { toast } from "sonner"

// Data will be fetched from API

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalRefunds: 0,
    netRevenue: 0
  })

  // Fetch transactions on mount
  useEffect(() => {
    fetchTransactions()
    fetchStats()
  }, [])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response: any = await transactionsApi.getTransactions()
      if (response.success && response.data) {
        // Map API response to Transaction type
        const mappedTransactions = response.data.map((txn: any) => ({
          id: txn.id,
          transactionId: txn.transaction_id,
          type: txn.type,
          status: txn.status,
          amount: parseFloat(txn.amount),
          currency: txn.currency,
          paymentMethod: txn.payment_method,
          userId: txn.user_id,
          userName: txn.user_name,
          userEmail: txn.user_email,
          orderId: txn.order_id,
          orderNumber: txn.order_number,
          description: txn.description,
          failureReason: txn.failure_reason,
          createdAt: new Date(txn.created_at),
          completedAt: txn.completed_at ? new Date(txn.completed_at) : undefined,
          failedAt: txn.failed_at ? new Date(txn.failed_at) : undefined,
        }))
        setTransactions(mappedTransactions)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast.error('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response: any = await transactionsApi.getStats()
      if (response.success && response.data) {
        setStats({
          totalRevenue: parseFloat(response.data.total_revenue) || 0,
          totalRefunds: parseFloat(response.data.total_refunds) || 0,
          netRevenue: parseFloat(response.data.net_revenue) || 0,
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch =
      txn.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (txn.orderId && txn.orderId.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus = statusFilter === "all" || txn.status === statusFilter
    const matchesType = typeFilter === "all" || txn.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const handleViewDetails = (txn: Transaction) => {
    setSelectedTransaction(txn)
    setIsDetailsOpen(true)
  }

  const handleExportTransactions = () => {
    if (filteredTransactions.length === 0) {
      toast.error("No transactions to export")
      return
    }
    exportTransactionsToCSV(filteredTransactions)
    toast.success(`Exported ${filteredTransactions.length} transactions to CSV`)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="success">Completed</Badge>
      case "pending":
        return <Badge variant="default">Pending</Badge>
      case "processing":
        return <Badge variant="default">Processing</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      case "cancelled":
        return <Badge variant="secondary">Cancelled</Badge>
      case "refunded":
        return <Badge variant="secondary">Refunded</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      order_payment: "Order Payment",
      refund: "Refund",
      wallet_topup: "Wallet Top-up",
      wallet_withdrawal: "Wallet Withdrawal",
    }
    return labels[type] || type
  }

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      waafi_pay: "Waafi Pay",
      edahab: "eDahab",
      premier_wallet: "Premier Wallet",
      cash_on_delivery: "Cash on Delivery",
      credit_card: "Credit Card",
      debit_card: "Debit Card",
    }
    return labels[method] || method
  }

  // Calculate totals
  const totalAmount = filteredTransactions
    .filter((txn) => txn.status === "completed" && txn.type === "order_payment")
    .reduce((sum, txn) => sum + txn.amount, 0)

  const totalRefunds = filteredTransactions
    .filter((txn) => txn.status === "completed" && txn.type === "refund")
    .reduce((sum, txn) => sum + txn.amount, 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            Track all payments and financial transactions ({filteredTransactions.length}{" "}
            transactions)
          </p>
        </div>
        <Button onClick={handleExportTransactions}>
          <Download className="mr-2 h-4 w-4" />
          Export Transactions
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Refunds</p>
              <p className="text-2xl font-bold">${stats.totalRefunds.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Net Revenue</p>
              <p className="text-2xl font-bold">${stats.netRevenue.toFixed(2)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by transaction ID, customer, order..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid gap-4 pt-4 border-t md:grid-cols-3">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Transaction Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="order_payment">Order Payment</SelectItem>
                    <SelectItem value="refund">Refund</SelectItem>
                    <SelectItem value="wallet_topup">Wallet Top-up</SelectItem>
                    <SelectItem value="wallet_withdrawal">Wallet Withdrawal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </div>
          )}
        </div>
      </Card>

      {/* Transactions Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground">Loading transactions...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                      <DollarSign className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">No Transactions Found</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                          ? "No transactions match your current filters. Try adjusting your search criteria."
                          : "There are no transactions yet. Transactions will appear here once customers make payments."}
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell className="font-mono text-sm">{txn.transactionId}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{txn.userName}</p>
                      <p className="text-sm text-muted-foreground">{txn.userEmail}</p>
                    </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{getTypeLabel(txn.type)}</Badge>
                </TableCell>
                <TableCell>
                  <span className={`font-semibold ${txn.type === "refund" ? "text-red-600" : "text-green-600"}`}>
                    {txn.type === "refund" ? "-" : "+"}${txn.amount.toFixed(2)}
                  </span>
                </TableCell>
                <TableCell>{getStatusBadge(txn.status)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(txn.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(txn)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Transaction Details Dialog */}
      <TransactionDetailsDialog
        transaction={selectedTransaction}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </div>
  )
}
