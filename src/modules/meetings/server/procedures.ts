import { db } from "@/db";
import { meetings, agents } from "@/db/schema";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { meetingsInsertSchema, meetingsUpdateSchema } from "../schema";
import z from "zod";
import { and, count, desc, eq, getTableColumns, ilike, sql } from "drizzle-orm";
import { DEFAULT_PAGE, MAX_PAGE_SIZE, MIN_PAGE_SIZE , DEFAULT_PAGE_SIZE} from "@/constants";
import { TRPCError } from "@trpc/server";
import { MeetingStatus } from "../types";

export const meetingsRouter = createTRPCRouter({
    update : protectedProcedure
    .input(meetingsUpdateSchema)
    .mutation(async({ctx, input}) => {
        const [updatedMeeting] = await db
        .update(meetings)
        .set(input)
        .where(and(
            eq(meetings.id, input.id),
            eq(meetings.userId, ctx.auth.user.id)
        )).returning();

        //TODO: Create stream Call, Upsert Stream User
       if(!updatedMeeting){
        throw new TRPCError({
            code : "NOT_FOUND",
            message : "Meeting not found"
        })
       }
       return updatedMeeting;
    }),
    remove : protectedProcedure
    .input(z.object({
        id : z.string()
    }))
    .mutation(async({ctx, input}) => {
        const [ id ] = 
        await db.delete(meetings)
        .where(and(
            eq(meetings.id, input.id),
            eq(meetings.userId, ctx.auth.user.id)
        )).returning();

        if(!id){
            throw new TRPCError({
                code : "NOT_FOUND",
                message : "Meeting not found"
            })
        }
        return id;
    }),
    getMany : protectedProcedure
    .input(z.object({
        page : z.number().default(DEFAULT_PAGE),
        pageSize : z.number()
                       .min(MIN_PAGE_SIZE)
                       .max(MAX_PAGE_SIZE)
                       .default(DEFAULT_PAGE_SIZE),
                search : z.string().nullish(),
                agentId : z.string().nullish(),
                status : z.enum([
                    MeetingStatus.ACTIVE,
                    MeetingStatus.COMPLETED,
                    MeetingStatus.CANCELLED,
                    MeetingStatus.UPCOMING,
                    MeetingStatus.PROCESSING
                ]).nullish(),
    }))
    .query(async({ctx, input}) =>{
        const { search, page, pageSize, agentId, status } = input;
        
        console.log("=== MEETINGS QUERY DEBUG ===");
        console.log("Current user ID:", ctx.auth.user.id);
        console.log("Query params:", { search, page, pageSize, agentId, status });
        
        const data = await db
        .select({
            ...getTableColumns(meetings),
            agent:agents,
            duration: sql<number>`(EXTRACT(EPOCH FROM (ended_at - started_at)))`.as("duration"),
        })
        .from(meetings)
        .innerJoin(agents, eq(meetings.agentId, agents.id))
        .where(
            and(
                eq(meetings.userId, ctx.auth.user.id),
                search ? ilike(meetings.name, `%${search}%`) : undefined,
                agentId ? eq(meetings.agentId, agentId) : undefined,
                status ? eq(meetings.status, status) : undefined
            )
        )
        .orderBy(desc(meetings.createdAt), desc(meetings.updatedAt))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

        console.log("Fetched meetings count:", data.length);
        console.log("Meetings data:", data);

        const [total] = await db
        .select({ count : count()})
        .from(meetings)
        .where(
            and(
                eq(meetings.userId, ctx.auth.user.id),
                search ? ilike(meetings.name, `%${search}%`) : undefined,
                agentId ? eq(meetings.agentId, agentId) : undefined,
                status ? eq(meetings.status, status) : undefined
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
    getOne : protectedProcedure
    .input(z.object({id: z.string()}))
    .query(async({ctx, input}) => {
        const [existingMeeting] = await db.select({
            ...getTableColumns(meetings),
            agent:agents,
                duration: sql<number>`(EXTRACT(EPOCH FROM (ended_at - started_at)))`.as("duration"),
        }).from(meetings)
        .innerJoin(agents, eq(meetings.agentId, agents.id))
        .where(and(
            eq(meetings.id, input.id),
            eq(meetings.userId, ctx.auth.user.id),
            eq(agents.userId, ctx.auth.user.id)
        ));
            if(!existingMeeting){
                throw new TRPCError({
                    code : "NOT_FOUND",
                    message : "Meeting not found"
                })
            }
        return existingMeeting;
    }),
    create : protectedProcedure.input(meetingsInsertSchema).mutation(async({input, ctx}) => {
        console.log("=== CREATE MEETING DEBUG ===");
        console.log("Input received:", JSON.stringify(input, null, 2));
        console.log("User ID:", ctx.auth.user.id);
        console.log("StartDate type:", typeof input.startDate, input.startDate);
        console.log("EndDate type:", typeof input.endDate, input.endDate);
        
        const [createdMeeting] = await db.insert(meetings).values({
            name: input.name,
            agentId: input.agentId,
            instructions: input.instructions,
            startDate: input.startDate,
            endDate: input.endDate,
            userId: ctx.auth.user.id,
        }).returning();
        return createdMeeting;
    })
});
