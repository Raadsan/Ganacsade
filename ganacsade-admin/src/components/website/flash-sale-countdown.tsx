"use client"

import { useEffect, useState } from "react"
import { Clock } from "lucide-react"

function pad(n: number) {
  return String(n).padStart(2, "0")
}

function getTimeLeft(endTime?: string | null) {
  if (!endTime) return null
  const end = new Date(endTime).getTime()
  const diff = end - Date.now()
  if (diff <= 0) return null
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  return { hours, minutes, seconds }
}

export function FlashSaleCountdown({ endTime }: { endTime?: string | null }) {
  const [left, setLeft] = useState(() => getTimeLeft(endTime))

  useEffect(() => {
    const timer = setInterval(() => {
      setLeft(getTimeLeft(endTime))
    }, 1000)
    return () => clearInterval(timer)
  }, [endTime])

  if (!left) return null

  return (
    <div className="flex items-center gap-2 text-sm">
      <Clock className="h-4 w-4 text-destructive" />
      <span className="text-muted-foreground">Ends in</span>
      <span className="font-mono font-semibold text-destructive">
        {pad(left.hours)}:{pad(left.minutes)}:{pad(left.seconds)}
      </span>
    </div>
  )
}
