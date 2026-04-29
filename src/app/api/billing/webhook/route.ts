import { NextRequest } from "next/server";

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  try {
    if (!STRIPE_WEBHOOK_SECRET) {
      return Response.json({ error: "Webhook not configured" }, { status: 500 });
    }

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return Response.json({ error: "Missing signature" }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return Response.json({ error: "Stripe secret key not configured" }, { status: 500 });
    }

    let stripe;
    try {
      stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    } catch (error) {
      console.error("[Webhook] Stripe SDK is unavailable:", error);
      return Response.json({ error: "Stripe integration not available" }, { status: 500 });
    }
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error("[Webhook] Signature verification failed:", err);
      return Response.json({ error: "Invalid signature" }, { status: 400 });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("[Webhook] Checkout completed:", session.id);
        // TODO: Update user subscription in database
        // await db.update(user).set({ plan: session.metadata.planId }).where(eq(user.id, userId));
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        console.log("[Webhook] Subscription updated:", subscription.id);
        // TODO: Handle plan changes
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        console.log("[Webhook] Subscription canceled:", subscription.id);
        // TODO: Downgrade user to free plan
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        console.log("[Webhook] Payment failed:", invoice.id);
        // TODO: Notify user, grace period handling
        break;
      }
      default:
        console.log("[Webhook] Unhandled event:", event.type);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Error:", error);
    return Response.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}