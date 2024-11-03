import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const { user_id } = await request.json();

  // Fetch the user's profile from Supabase
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user_id)
    .single();

  if (error) {
    return NextResponse.json({ error: "User not found" }, { status: 500 });
  }

  // Create Stripe customer if not existing
  let customerId = profile.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      metadata: { supabase_user_id: user_id },
    });
    customerId = customer.id;

    // Store the customer ID in Supabase
    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user_id);
  }

  // Create a new Stripe Checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [
      {
        price: "price_1QGe60BMG61myACDpaLAi0OQ",
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${request.headers.get("origin")}`,
    cancel_url: `${request.headers.get("origin")}`,
  });

  return NextResponse.json({ id: session.id });
}
