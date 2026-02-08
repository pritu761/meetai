import { ReactNode,useState } from "react";
import { ChevronsUpDownIcon } from "lucide-react";

import {cn} from "@/lib/utils"
import {Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandResponsiveDialog,
} from "@/components/ui/command"

interface Props{
    options:Array<{id:string,value:string,children:ReactNode}>;
    onSelect:(value:string) => void;
    onSearch?:(value:string) => void;
    value?:string;
    placeholder?:string;
    className?:string;
}

export const CommandSelect = ({options,value,placeholder,className,onSelect, onSearch}:Props) => {
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const selectedOption = options.find((option) => option.id === value);


    const handleClose = (value: boolean) => {
      onSearch?.("");
      setOpen(value);
    }
    return(
        <>
        <Button type="button" variant="outline" className={cn("h-9 justify-between px-2",!selectedOption && "text-muted-foreground", className)} onClick={() => setOpen(true)}>
            <div>
                {selectedOption?.children ?? placeholder}
            </div>
            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
        <CommandResponsiveDialog open={open} onOpenChange={handleClose} shouldFilter={!onSearch}>
            <CommandInput placeholder="Search.." onValueChange={onSearch} />
              <CommandEmpty>
                <span className="text-muted-foreground text-sm"> No results found.</span>
              </CommandEmpty>
              {options.map((option) => (
                <CommandItem
                  key={option.id}
                  onSelect={() => {
                    onSelect(option.value);
                    setOpen(false);
                  }}
                >
                  {option.children}
                </CommandItem>
              ))}
        </CommandResponsiveDialog>
        </>
    )
}