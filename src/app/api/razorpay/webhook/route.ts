import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (RAZORPAY_WEBHOOK_SECRET && signature) {
      const expectedSignature = crypto
        .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
        .update(rawBody)
        .digest("hex");

      if (signature !== expectedSignature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    const event = JSON.parse(rawBody);

    switch (event.event) {
      case "order.paid": {
        const { planId, billingPeriod, userId } = event.payload.order.details.notes || {};
        if (userId && planId) {
          const periodMonths = billingPeriod === "yearly" ? 12 : 1;
          const expiryDate = new Date();
          expiryDate.setMonth(expiryDate.getMonth() + periodMonths);

          await db
            .update(user)
            .set({
              updatedAt: new Date(),
            })
            .where(eq(user.id, userId));
        }
        break;
      }

      case "payment.failed": {
        console.log("[Razorpay Webhook] Payment failed:", event.payload.payment.entity.id);
        break;
      }

      default:
        console.log(`[Razorpay Webhook] Unhandled event: ${event.event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Razorpay Webhook] Error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}