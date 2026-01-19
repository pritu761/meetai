import { db } from "@/db";
import { agents } from "@/db/schema";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { agentInsertSchema } from "../schema";
import z from "zod";
import { and, count, desc, eq, getTableColumns, ilike, sql } from "drizzle-orm";
import { DEFAULT_PAGE, MAX_PAGE_SIZE, MIN_PAGE_SIZE , DEFAULT_PAGE_SIZE} from "@/constants";

export const agentsRouter = createTRPCRouter({
    getMany : protectedProcedure
    .input(z.object({
        page : z.number().default(DEFAULT_PAGE),
        pageSize : z.number()
                       .min(MIN_PAGE_SIZE)
                       .max(MAX_PAGE_SIZE)
                       .default(DEFAULT_PAGE_SIZE),
                search : z.string().nullish(),          
    }))
    .query(async({ctx, input}) =>{
        const { search, page, pageSize } = input;
        
        console.log("=== AGENTS QUERY DEBUG ===");
        console.log("Current user ID:", ctx.auth.user.id);
        console.log("Query params:", { search, page, pageSize });
        
        const data = await db
        .select({
            ...getTableColumns(agents),
            meetingCount:sql<number>`6`,
        })
        .from(agents)
        .where(
            and(
                eq(agents.userId, ctx.auth.user.id),
                search ? ilike(agents.name, `%${search}%`) : undefined
            )
        )
        .orderBy(desc(agents.createdAt), desc(agents.updatedAt))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

        console.log("Fetched agents count:", data.length);
        console.log("Agents data:", data);

        const [total] = await db
        .select({ count : count()})
        .from(agents)
        .where(
            and(
                eq(agents.userId, ctx.auth.user.id),
                search ? ilike(agents.name, `%${search}%`) : undefined
            )
        )

        console.log("Total count:", total.count);

        const totalPages = Math.ceil(total.count / pageSize);
        return {
            items: data,
            total: total.count,
            totalPages,
        };
    }),
    getOne : baseProcedure
    .input(z.object({id: z.string()}))
    .query(async({input}: {input: {id: string}}) => {
        const [existingAgent] = await db.select({
            ...getTableColumns(agents),
            meetingCount:sql<number>`0`,
        }).from(agents).where(eq(agents.id, input.id));
        return existingAgent;
    }),
    create : protectedProcedure.input(agentInsertSchema).mutation(async({input, ctx}: {input: any, ctx: any}) => {
        const [createdAgent] = await db.insert(agents).values({
            ...input,
            userId: ctx.auth.user.id,
        }).returning();
        return createdAgent;
    })
});