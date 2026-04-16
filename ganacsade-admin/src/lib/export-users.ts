import { User } from "@/types"

export function exportUsersToCSV(users: User[]) {
  // CSV Headers
  const headers = [
    "ID",
    "Name",
    "Email",
    "Phone",
    "Status",
    "Gender",
    "Language",
    "Email Verified",
    "Phone Verified",
    "Addresses Count",
    "Payment Methods Count",
    "Created At",
    "Last Login",
  ]

  // Convert users to CSV rows
  const rows = users.map((user) => [
    user.id,
    user.displayName,
    user.email,
    user.phoneNumber,
    user.status,
    user.gender,
    user.preferredLanguage,
    user.isEmailVerified ? "Yes" : "No",
    user.isPhoneVerified ? "Yes" : "No",
    user.addresses.length.toString(),
    user.paymentMethods.length.toString(),
    user.createdAt ? new Date(user.createdAt).toLocaleString() : "",
    user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never",
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
  link.setAttribute("download", `users_export_${new Date().toISOString().split("T")[0]}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
