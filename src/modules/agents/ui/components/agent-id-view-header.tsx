import {
    Breadcrumb,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbPage,
    BreadcrumbSeparator,
    BreadcrumbEllipsis,

} from "@/components/ui/breadcrumb"
import { ChevronRightIcon, TrashIcon, PencilIcon, MoreVertical, MoreVerticalIcon } from "lucide-react"
import Link from "next/link"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"





interface Props{
    agentId : string,
    agentName : string,
    onEditAgent : () => void,
    onDeleteAgent : () => void
}



export const AgentIdViewHeader= ({agentId, agentName, onEditAgent, onDeleteAgent} : Props) => {
    return (
        <div className="flex items-center justify-between">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild className="font-medium text-xl">
                        <Link href="/agents">My Agents</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="text-foreground text-xl font-medium [&svg]:size-4">
                    <ChevronRightIcon />
                    </BreadcrumbSeparator>
                    <BreadcrumbItem>    
                        <BreadcrumbLink asChild className="font-medium text-xl text-foreground">
                        <Link href={`/agents/${agentId}`}>{agentName}</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <button className="text-foreground"
                    >
                        <MoreVerticalIcon />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={onEditAgent}>
                        <PencilIcon className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onDeleteAgent}>
                        <TrashIcon className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}