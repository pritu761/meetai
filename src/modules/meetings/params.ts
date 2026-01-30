import {parseAsInteger, parseAsString} from "nuqs/server"

import { DEFAULT_PAGE } from "@/constants"
import { createLoader } from "nuqs/server"

export const filtersSearchParams = {
    search : parseAsString.withDefault("").withOptions({clearOnDefault:true}),
    page : parseAsInteger.withDefault(DEFAULT_PAGE).withOptions({clearOnDefault:true}),
    pageSize : parseAsInteger.withDefault(3)
}

export const loadSearchParams = createLoader(filtersSearchParams)
