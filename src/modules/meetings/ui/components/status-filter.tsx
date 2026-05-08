import {
    CircleXIcon,
    VideoIcon,
    LoaderIcon,
    ClockArrowUpIcon,
    CircleCheckIcon
} from "lucide-react";

import { CommandSelect } from "@/components/command-select";
import { MeetingStatus } from "../../types";
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";

const options = [
    {
         id: MeetingStatus.UPCOMING,
         value:MeetingStatus.UPCOMING,
         children:(
            <div className="flex items-center gap-x-3 capitalize">
                <span className="inline-flex size-6 items-center justify-center rounded-full border bg-muted/30">
                    <ClockArrowUpIcon className="size-3.5" />
                </span>
                <span className="text-sm font-medium">{MeetingStatus.UPCOMING}</span>
            </div>
         )
    },
    {
        id: MeetingStatus.ACTIVE,
        value:MeetingStatus.ACTIVE,
        children:(
           <div className="flex items-center gap-x-3 capitalize">
               <span className="inline-flex size-6 items-center justify-center rounded-full border bg-muted/30">
                   <VideoIcon className="size-3.5" />
               </span>
               <span className="text-sm font-medium">{MeetingStatus.ACTIVE}</span>
           </div>
        )
     },
     {
        id: MeetingStatus.COMPLETED,
        value:MeetingStatus.COMPLETED,
        children:(
           <div className="flex items-center gap-x-3 capitalize">
               <span className="inline-flex size-6 items-center justify-center rounded-full border bg-muted/30">
                   <CircleCheckIcon className="size-3.5" />
               </span>
               <span className="text-sm font-medium">{MeetingStatus.COMPLETED}</span>
           </div>
        )
     },
     {
        id: MeetingStatus.CANCELLED,
        value:MeetingStatus.CANCELLED,
        children:(
           <div className="flex items-center gap-x-3 capitalize">
               <span className="inline-flex size-6 items-center justify-center rounded-full border bg-muted/30">
                   <CircleXIcon className="size-3.5" />
               </span>
               <span className="text-sm font-medium">{MeetingStatus.CANCELLED}</span>
           </div>
        )
     },
     {
        id: MeetingStatus.PROCESSING,
        value:MeetingStatus.PROCESSING,
        children:(
           <div className="flex items-center gap-x-3 capitalize">
               <span className="inline-flex size-6 items-center justify-center rounded-full border bg-muted/30">
                   <LoaderIcon className="size-3.5 animate-spin" />
               </span>
               <span className="text-sm font-medium">{MeetingStatus.PROCESSING}</span>
           </div>
        )
     },
     
];

export const StatusFilter = () => {
    const [{ status }, setFilters] = useMeetingsFilters();

    return (
        <CommandSelect
            placeholder="Status"
            className="h-9 w-full sm:w-auto"
            value={status ?? ""}
            onSelect={(value) => setFilters({ status: value as MeetingStatus })}
            options={options}
        />
    );
};
