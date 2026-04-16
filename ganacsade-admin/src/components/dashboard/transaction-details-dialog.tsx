"use client"

import { Transaction } from "@/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  CreditCard, 
  User, 
  Mail, 
  Calendar, 
  DollarSign,
  FileText,
  ShoppingCart
} from "lucide-react"

interface TransactionDetailsDialogProps {
  transaction: Transaction | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TransactionDetailsDialog({
  transaction,
  open,
  onOpenChange,
}: TransactionDetailsDialogProps) {
  if (!transaction) return null

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>
            Complete information about transaction {transaction.transactionId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Transaction Info */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Transaction Information</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Transaction ID</span>
                <span className="font-mono font-medium">{transaction.transactionId}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Type</span>
                <Badge variant="outline">{getTypeLabel(transaction.type)}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                {getStatusBadge(transaction.status)}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Amount</span>
                </div>
                <span className="text-lg font-bold text-green-600">
                  ${transaction.amount.toFixed(2)} {transaction.currency}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Payment Method</span>
                </div>
                <span className="font-medium">{getPaymentMethodLabel(transaction.paymentMethod)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Customer Info */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Customer Name</p>
                  <p className="font-medium">{transaction.userName}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{transaction.userEmail}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">User ID</p>
                  <p className="font-mono text-sm">{transaction.userId}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Order Info */}
          {transaction.orderId && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-3">Order Information</h3>
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Order ID</p>
                    <p className="font-mono font-medium">{transaction.orderId}</p>
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Description</h3>
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
              <p className="text-sm">{transaction.description}</p>
            </div>
          </div>

          <Separator />

          {/* Timestamps */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-sm font-medium">
                    {new Date(transaction.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {transaction.completedAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-sm font-medium">
                      {new Date(transaction.completedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {transaction.failureReason && (
                <div className="p-3 border rounded-lg bg-red-50 dark:bg-red-950">
                  <p className="text-sm font-medium text-red-900 dark:text-red-100">
                    Failure Reason
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    {transaction.failureReason}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
          {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3">Additional Information</h3>
                <div className="space-y-2">
                  {Object.entries(transaction.metadata).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
