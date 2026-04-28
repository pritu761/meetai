import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const PLAN_PRICES: Record<string, { monthly: number; yearly: number }> = {
  pro: { monthly: 1900, yearly: 18240 },
  business: { monthly: 4900, yearly: 47040 },
};

const PLAN_NAMES: Record<string, string> = {
  pro: "MeetAI Pro",
  business: "MeetAI Business",
};

const razorpay = RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET
  ? new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET })
  : null;

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planId, billingPeriod } = await req.json();

    if (!planId || !PLAN_PRICES[planId]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const period = billingPeriod === "yearly" ? "yearly" : "monthly";
    const amount = PLAN_PRICES[planId][period];
    const receipt = `receipt_${planId}_${period}_${Date.now()}`;

    if (!razorpay) {
      return NextResponse.json({
        demo: true,
        message: `Demo mode: Would create Razorpay order for ${PLAN_NAMES[planId]} (${period})`,
        amount,
        planId,
        billingPeriod: period,
      });
    }

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt,
      notes: {
        planId,
        billingPeriod: period,
        userId: session.user.id,
        userEmail: session.user.email,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("[Razorpay Order] Error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}