import {z} from "zod";

export const agentInsertSchema = z.object({
    name:z.string().min(1, "Name is required"),
    instructions:z.string().min(1, "Instructions are required"),
})  

export const agentupdateSchema = agentInsertSchema.extend({
    id:z.string().min(1, "Id is required"),
})