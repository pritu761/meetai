import { SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useAgentsFilters } from "../../hooks/use-agents-filters";

export const SearchFilter = () => {
    const [filters, setFilters] = useAgentsFilters()
    return (
        <div className="relative flex items-center w-full max-w-md">
            <SearchIcon className="absolute left-3 w-4 h-4 text-muted-foreground"/>
            <Input 
                placeholder="Search agents..."
                value={filters.search || ""}
                onChange={(e) => setFilters({search: e.target.value })}
                className="pl-10"
                />
        </div>
    )
}