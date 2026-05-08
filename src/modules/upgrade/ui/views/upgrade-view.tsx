"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, Zap, Crown, Rocket, Shield, Star, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
  };
  theme?: {
    color?: string;
  };
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  on: (event: string, callback: () => void) => void;
  open: () => void;
}

const plans = [
  {
    id: "free",
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Perfect for getting started",
    icon: <Zap className="w-8 h-8" />,
    gradient: "from-gray-500 to-gray-600",
    features: [
      "1 AI Agent",
      "3 meetings per month",
      "30 min call duration",
      "Basic video calls",
      "Community support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 19,
    yearlyPrice: 15,
    description: "For professionals who need more",
    icon: <Crown className="w-8 h-8" />,
    gradient: "from-amber-500 to-orange-500",
    badge: "Most Popular",
    popular: true,
    features: [
      "5 AI Agents",
      "Unlimited meetings",
      "2 hour call duration",
      "Meeting recordings",
      "Custom agent instructions",
      "Priority support",
    ],
  },
  {
    id: "business",
    name: "Business",
    monthlyPrice: 49,
    yearlyPrice: 39,
    description: "For teams and growing businesses",
    icon: <Rocket className="w-8 h-8" />,
    gradient: "from-blue-500 to-purple-600",
    badge: "Best Value",
    features: [
      "Unlimited AI Agents",
      "Unlimited meetings",
      "Unlimited call duration",
      "Meeting recordings & transcripts",
      "Team collaboration",
      "API access",
      "Priority support",
    ],
  },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "CEO, TechStart",
    content: "MeetAI transformed our remote meetings. The AI agent takes notes and summaries automatically!",
    avatar: "SC",
  },
  {
    name: "Michael Roberts",
    role: "Product Manager",
    content: "The Business plan is worth every penny. Our team productivity increased by 40%.",
    avatar: "MR",
  },
  {
    name: "Emily Watson",
    role: "Freelance Consultant",
    content: "Pro plan gives me everything I need. The AI summaries are incredibly accurate.",
    avatar: "EW",
  },
];

const faqs = [
  {
    q: "Can I switch plans anytime?",
    a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit/debit cards, UPI, net banking, and wallets through Razorpay.",
  },
  {
    q: "Is there a free trial?",
    a: "Both Pro and Business plans come with a 14-day free trial. No credit card required.",
  },
  {
    q: "Can I cancel my subscription?",
    a: "Yes, cancel anytime. You'll retain access until the end of your billing period.",
  },
];

export const UpgradeView = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleUpgrade = async (planId: string) => {
    if (planId === "free") return;
    if (!session?.user) {
      toast.error("Please sign in to upgrade");
      return;
    }

    setLoadingPlan(planId);
    try {
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, billingPeriod: isYearly ? "yearly" : "monthly" }),
      });

      const data = await res.json();

      if (data.demo) {
        toast.success(`Demo mode: Would create ${planId} subscription`);
        setLoadingPlan(null);
        return;
      }

      if (!data.orderId || !data.keyId) {
        throw new Error("Failed to create order");
      }

      const plan = plans.find((p) => p.id === planId);
      const amount = isYearly ? plan!.yearlyPrice : plan!.monthlyPrice;

      const options: RazorpayOptions = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "MeetAI",
        description: `${plan?.name} Plan - ${isYearly ? "Yearly" : "Monthly"}`,
        order_id: data.orderId,
        handler: async (response) => {
          toast.success("Payment successful! Your plan has been upgraded.");
          setLoadingPlan(null);
        },
        prefill: {
          name: session.user.name || undefined,
          email: session.user.email || undefined,
        },
        theme: {
          color: "#6366f1",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("modal.closed", () => {
        setLoadingPlan(null);
      });
      razorpay.open();
    } catch (error) {
      toast.error("Failed to initiate payment. Please try again.");
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Simple, transparent pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-800 to-purple-800 dark:from-white dark:via-indigo-200 dark:to-purple-200 bg-clip-text text-transparent">
            Upgrade Your Meetings
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock the full power of AI-powered meetings with our flexible plans
          </p>

          <div className="flex items-center justify-center gap-4 pt-6">
            <span className={`text-sm font-medium ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}>
              Monthly
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-indigo-600"
            />
            <span className={`text-sm font-medium ${isYearly ? "text-foreground" : "text-muted-foreground"}`}>
              Yearly
            </span>
            {isYearly && (
              <Badge className="bg-emerald-500 hover:bg-emerald-600">Save 20%</Badge>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan) => {
            const isCurrentPlan = plan.id === "free";
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            const isLoading = loadingPlan === plan.id;

            return (
              <Card
                key={plan.id}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                  plan.popular
                    ? "border-indigo-500 shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-500"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-0 left-1/2 -translate-x-1/2">
                    <Badge className={`bg-gradient-to-r ${plan.gradient} text-white px-4 py-1 text-xs font-semibold shadow-lg`}>
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-5`} />

                <CardHeader className="text-center pb-2 relative">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${plan.gradient} text-white shadow-lg`}
                  >
                    {plan.icon}
                  </div>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                </CardHeader>

                <CardContent className="relative">
                  <div className="text-center mb-6">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold">${price}</span>
                      {price > 0 && (
                        <span className="text-muted-foreground">/{isYearly ? "mo" : "mo"}</span>
                      )}
                    </div>
                    {isYearly && price > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Billed ${price * 12}/year
                      </p>
                    )}
                    {price === 0 && (
                      <p className="text-sm text-muted-foreground">Forever free</p>
                    )}
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className={`p-0.5 rounded-full bg-gradient-to-br ${plan.gradient} text-white`}>
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="relative pt-4">
                  <Button
                    className={`w-full ${plan.popular ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700" : ""}`}
                    variant={plan.popular ? "default" : "outline"}
                    disabled={isCurrentPlan || isLoading}
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : isCurrentPlan ? (
                      "Current Plan"
                    ) : (
                      <>
                        Upgrade to {plan.name}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Trusted by thousands of teams</h2>
            <p className="text-muted-foreground">See what our customers have to say</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <Card key={i} className="border-slate-200 dark:border-slate-800">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm mb-4">&ldquo;{testimonial.content}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="max-w-3xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Everything you need to know about our plans</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <Card
                key={i}
                className={`cursor-pointer transition-all duration-200 ${
                  expandedFaq === i ? "border-indigo-500 shadow-md" : "border-slate-200 dark:border-slate-800"
                }`}
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
              >
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{faq.q}</h3>
                    <ArrowRight
                      className={`w-4 h-4 transition-transform duration-200 ${
                        expandedFaq === i ? "rotate-90" : ""
                      }`}
                    />
                  </div>
                  {expandedFaq === i && (
                    <p className="text-sm text-muted-foreground mt-3">{faq.a}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-100 dark:bg-slate-800 text-sm">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>30-day money-back guarantee. No questions asked.</span>
          </div>
        </div>
      </div>
    </div>
  );
};