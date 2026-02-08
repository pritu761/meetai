import {parseAsInteger, parseAsString, parseAsStringEnum} from "nuqs/server"

import { DEFAULT_PAGE } from "@/constants"
import { createLoader } from "nuqs/server"
import { MeetingStatus } from "./types"

export const filtersSearchParams = {
    search : parseAsString.withDefault("").withOptions({clearOnDefault:true}),
    page : parseAsInteger.withDefault(DEFAULT_PAGE).withOptions({clearOnDefault:true}),
    pageSize : parseAsInteger.withDefault(3),
    status : parseAsStringEnum(Object.values(MeetingStatus)),
        agentId : parseAsString.withDefault("").withOptions({clearOnDefault:true})
}

export const loadSearchParams = createLoader(filtersSearchParams)
