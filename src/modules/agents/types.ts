import { inferRouterOutputs } from "@trpc/server";

import { AppRouter } from "@/trpc/routers/_app";


export type Agent = inferRouterOutputs<AppRouter>["agents"]["getOne"];