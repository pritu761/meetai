import { SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";

export const SearchFilter = () => {
    const [filters, setFilters] = useMeetingsFilters()
    return (
        <div className="relative flex items-center w-full sm:max-w-md">
            <SearchIcon className="absolute left-3 w-4 h-4 text-muted-foreground"/>
            <Input 
                placeholder="Search meetings..."
                value={filters.search || ""}
                onChange={(e) => setFilters({search: e.target.value })}
                className="pl-10"
                />
        </div>
    )
}
