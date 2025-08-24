import { db } from "@/db";
import { agents } from "@/db/schema";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { agentInsertSchema } from "../schema";
import z from "zod";
import { eq, getTableColumns, sql } from "drizzle-orm";

export const agentsRouter = createTRPCRouter({
    getMany : protectedProcedure.query(async() =>{
        const data = await db
        .select({
            ...getTableColumns(agents),
            meetingCount:sql<number>`0`,
        })
        .from(agents)
        return data;
    }),
    getOne : baseProcedure.input(z.object({id: z.string()})).query(async({input}: {input: {id: string}}) => {
        const [existingAgent] = await db.select().from(agents).where(eq(agents.id, input.id));
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