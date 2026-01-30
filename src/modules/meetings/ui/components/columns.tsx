"use client"

import { ColumnDef } from "@tanstack/react-table"
import { GeneratedAvatar } from "@/components/generated-avatar"
import { CornerDownRightIcon, CalendarIcon, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

export type Meeting = {
  id: string
  name: string
  agentId: string
  status: "pending" | "completed" | "cancelled" | "upcoming"
  startDate: string | Date
  endDate: string | Date
  createdAt: string | Date
  updatedAt: string | Date
  instructions: string
  userId: string
  summary: string | null
  transcriptUrl: string | null
  recordingUrl: string | null
}

export const columns: ColumnDef<Meeting>[] = [
  {
    accessorKey: "name",
    header: "Meeting Name",
    cell: ({row}) => (
      <div className="flex flex-col gap-y-1">
        <div className="flex items-center gap-x-2">
          <GeneratedAvatar 
            variant="bottts"
            seed={row.original.name}
            className="size-8" 
          />
          <span className="font-semibold capitalize">{row.original.name}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({row}) => {
      const statusColors = {
        upcoming: "bg-blue-100 text-blue-700 border-blue-200",
        pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
        completed: "bg-green-100 text-green-700 border-green-200",
        cancelled: "bg-red-100 text-red-700 border-red-200",
      }
      return (
        <Badge 
          variant="outline" 
          className={statusColors[row.original.status as keyof typeof statusColors]}
        >
          {row.original.status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({row}) => (
      <div className="flex items-center gap-x-2">
        <CalendarIcon className="size-4 text-muted-foreground" />
        <span className="text-sm">
          {new Date(row.original.startDate).toLocaleDateString()} at {new Date(row.original.startDate).toLocaleTimeString()}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({row}) => (
      <div className="flex items-center gap-x-2">
        <Clock className="size-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(row.original.createdAt), { addSuffix: true })}
        </span>
      </div>
    ),
  },
]
