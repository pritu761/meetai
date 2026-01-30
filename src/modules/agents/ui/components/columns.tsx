"use client"

import { ColumnDef } from "@tanstack/react-table"
import { AgentGetOne } from "@/modules/agents/types"
import { GeneratedAvatar } from "@/components/generated-avatar"
import { CornerDownRightIcon, VideoIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export type Agent = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  userId: string
  instructions: string
}

export const columns: ColumnDef<AgentGetOne>[] = [
  {
        accessorKey: "name",
        header: "Agent Name",
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
                <div className="flex items-center gap-x-2">
                    <div className="flex items-center gap-x-1">
                        <CornerDownRightIcon  className="size-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground max-w-[200px] truncate capitalize">{row.original.instructions}</span>
                    </div>

                </div>

            </div>
        ),
  },
  {
    accessorKey: "instructions",
    header: "Instructions",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
  },
  {
    accessorKey:"meetingCount",
    header: "Meetings",
    cell: ({row}) => (
        <Badge variant="outline" className="flex items-center gap-x-2 [&>svg]:size-4">
        <VideoIcon className="text-blue-700" />
        {row.original.meetingCount} {row.original.meetingCount === 1 ? "Meeting" : "Meetings"}
        </Badge>
    ),

  }
]