"use client"

import { ColumnDef } from "@tanstack/react-table"
import { GeneratedAvatar } from "@/components/generated-avatar"
import { CornerDownRightIcon, CalendarIcon, Clock, CircleCheckIcon, CircleXIcon, LoaderIcon, ClockArrowUpIcon, ClockFadingIcon, VideoIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow, format } from "date-fns"
import { cn } from "@/lib/utils"
import { MeetingGetMany } from "../../types"


function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "No duration"
  const roundedSeconds = Math.round(seconds)
  const hours = Math.floor(roundedSeconds / 3600)
  const minutes = Math.floor((roundedSeconds % 3600) / 60)
  const parts: string[] = []
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0 || hours === 0) parts.push(`${minutes}m`)
  return parts.join(" ")
}

const statusIconMap = {
  upcoming: ClockArrowUpIcon,
  completed: CircleCheckIcon,
  active: VideoIcon,
  cancelled: CircleXIcon,
  processing: LoaderIcon,
}

const statusColorMap = {
  upcoming: "bg-yellow-500/20 text-yellow-800 border-yellow-800/5",
  active: "bg-blue-500/20 text-blue-800 border-blue-800/5",
  completed: "bg-emerald-500/20 text-emerald-800 border-emerald-800/5",
  cancelled: "bg-rose-500/20 text-rose-800 border-rose-800/5",
  processing: "bg-gray-300/20 text-gray-800 border-gray-800/5",
}
export const columns: ColumnDef<MeetingGetMany>[] = [
  {
    accessorKey: "name",
    header: "Meeting Name",
    cell: ({row}) => (
      <div className="flex flex-col gap-y-1">
        <span className="font-semibold capitalize">{row.original.name}</span>
        
        <div className="flex items-center gap-x-2">
          <div className="flex items-center gap-x-1">

          <CornerDownRightIcon className="size-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground max-w-[200px] truncate capitalize">
            {row.original.agent.name}
          </span>
          </div>
          <GeneratedAvatar
            variant="bottts"
            seed={row.original.agent.name}
            className="size-4" />
          <span className="text-sm text-muted-foreground">
            {row.original.startDate ? format(new Date(row.original.startDate), "MMM d") : "Not started yet" }
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({row}) => {
      const Icon = statusIconMap[row.original.status as keyof typeof statusIconMap]
      return (
        <Badge 
          variant="outline" 
          className={cn(
            "capitalize [&>svg]:size-4 text-muted-foreground",
            statusColorMap[row.original.status as keyof typeof statusColorMap],
          )}
        >
          <Icon
            className={cn(
              row.original.status === "processing" && "animate-spin",
            )}
          />
          {row.original.status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({row}) => {
      const date = new Date(row.original.startDate);
      return (
        <div className="flex items-center gap-x-2">
          <CalendarIcon className="size-4 text-muted-foreground" />
          <span className="text-sm">
            {format(date, "MMM d, yyyy")} at {format(date, "h:mm a")}
          </span>
        </div>
      );
    },
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
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="capitalize [&>svg]:size-4 flex items-center gap-x-2"
      >
        <ClockFadingIcon className="text-blue-700" />
        {row.original.duration
          ? formatDuration(row.original.duration)
          : "No duration"}
      </Badge>
    ),
  },
]
