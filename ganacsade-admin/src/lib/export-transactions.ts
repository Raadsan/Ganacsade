import { Transaction } from "@/types"

export function exportTransactionsToCSV(transactions: Transaction[]) {
  // CSV Headers
  const headers = [
    "Transaction ID",
    "Type",
    "Status",
    "Amount",
    "Currency",
    "Payment Method",
    "Customer Name",
    "Customer Email",
    "Order ID",
    "Description",
    "Created At",
    "Completed At",
  ]

  // Convert transactions to CSV rows
  const rows = transactions.map((txn) => [
    txn.transactionId,
    txn.type.replace(/_/g, " "),
    txn.status,
    txn.amount.toFixed(2),
    txn.currency,
    txn.paymentMethod.replace(/_/g, " "),
    txn.userName,
    txn.userEmail,
    txn.orderId || "",
    txn.description,
    new Date(txn.createdAt).toLocaleString(),
    txn.completedAt ? new Date(txn.completedAt).toLocaleString() : "",
  ])

  // Combine headers and rows
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${cell?.toString().replace(/"/g, '""') || ""}"`).join(",")
    ),
  ].join("\n")

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", `transactions_export_${new Date().toISOString().split("T")[0]}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
