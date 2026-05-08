import { z } from "zod";

export const checkoutCreateSchema = z.object({
  planId: z.string().min(1, "Plan is required"),
  billingPeriod: z.enum(["monthly", "yearly"]).default("monthly"),
});

export type CheckoutCreateInput = z.infer<typeof checkoutCreateSchema>;

export const PLANS = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    maxAgents: 1,
    maxMeetingsPerMonth: 3,
    maxCallDuration: 1800, // 30 minutes
    recordings: false,
    transcripts: false,
    summaries: false,
    teamMembers: 1,
    apiAccess: false,
    prioritySupport: false,
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 19,
    maxAgents: 5,
    maxMeetingsPerMonth: Infinity,
    maxCallDuration: 7200, // 2 hours
    recordings: true,
    transcripts: true,
    summaries: true,
    teamMembers: 3,
    apiAccess: false,
    prioritySupport: true,
  },
  business: {
    id: "business",
    name: "Business",
    price: 49,
    maxAgents: Infinity,
    maxMeetingsPerMonth: Infinity,
    maxCallDuration: Infinity,
    recordings: true,
    transcripts: true,
    summaries: true,
    teamMembers: Infinity,
    apiAccess: true,
    prioritySupport: true,
  },
} as const;

export type PlanId = keyof typeof PLANS;
export type Plan = (typeof PLANS)[PlanId];