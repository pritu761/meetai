import { NextRequest } from "next/server";

/**
 * Stripe Checkout API
 * Creates a Stripe checkout session for plan upgrades.
 * 
 * To integrate:
 * 1. Install stripe: npm install stripe
 * 2. Add STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to .env
 * 3. Create products/prices in Stripe Dashboard
 * 4. Add a NEXT_PUBLIC_APP_URL for redirect URLs
 */

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Price ID mapping - update these with your actual Stripe price IDs
const PRICE_MAP: Record<string, Record<string, string>> = {
  price_pro_monthly: {
    monthly: "price_pro_monthly_stripe_id",   // Replace with actual Stripe price ID
    yearly: "price_pro_yearly_stripe_id",     // Replace with actual Stripe price ID
  },
  price_business_monthly: {
    monthly: "price_business_monthly_stripe_id",  // Replace with actual Stripe price ID
    yearly: "price_business_yearly_stripe_id",    // Replace with actual Stripe price ID
  },
};

export async function POST(req: NextRequest) {
  try {
    const { planId, billingPeriod } = await req.json();

    if (!planId) {
      return Response.json({ error: "Missing planId" }, { status: 400 });
    }

    // Check if Stripe is configured
    if (!STRIPE_SECRET_KEY) {
      // Demo mode - return a mock response
      return Response.json({
        url: null,
        message: `Demo mode: Would redirect to Stripe checkout for ${planId} (${billingPeriod || "monthly"})`,
        planId,
        billingPeriod: billingPeriod || "monthly",
      });
    }

    // Initialize Stripe
    const stripe = require("stripe")(STRIPE_SECRET_KEY);

    // Get the correct price ID
    const period = billingPeriod === "yearly" ? "yearly" : "monthly";
    const priceId = PRICE_MAP[planId]?.[period];

    if (!priceId) {
      return Response.json({ error: "Invalid plan selected" }, { status: 400 });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${APP_URL}/upgrade?success=true`,
      cancel_url: `${APP_URL}/upgrade?canceled=true`,
      metadata: {
        planId,
        billingPeriod: period,
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error("[Billing Checkout] Error:", error);
    return Response.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

/**
 * Webhook handler for Stripe events
 * POST /api/billing/webhook
 * 
 * To set up:
 * 1. Create this as a separate route at /api/billing/webhook
 * 2. Configure STRIPE_WEBHOOK_SECRET in .env
 * 3. Add the webhook URL in Stripe Dashboard
 * 
 * Events to handle:
 * - checkout.session.completed: Activate subscription
 * - customer.subscription.updated: Handle plan changes
 * - customer.subscription.deleted: Handle cancellations
 * - invoice.payment_failed: Handle payment failures
 */