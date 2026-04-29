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

    if (!RAZORPAY_WEBHOOK_SECRET) {
      if (process.env.NODE_ENV !== "development") {
        return NextResponse.json(
          { error: "Webhook secret is not configured" },
          { status: 500 }
        );
      }
    } else {
      if (!signature) {
        return NextResponse.json({ error: "Missing signature" }, { status: 400 });
      }

      const expectedSignature = crypto
        .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
        .update(rawBody)
        .digest("hex");

      const signatureBuffer = Buffer.from(signature, "utf8");
      const expectedSignatureBuffer = Buffer.from(expectedSignature, "utf8");

      if (
        signatureBuffer.length !== expectedSignatureBuffer.length ||
        !crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
      ) {
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
              plan: planId,
              planExpiry: expiryDate,
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