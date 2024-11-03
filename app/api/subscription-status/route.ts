import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  // TODO: do proper auth check
  const { user_id } = await request.json();

  // Fetch the user's profile from Supabase
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("stripe_customer_id,stripe_subscription_id")
    .eq("id", user_id)
    .single();

  if (error || !profile.stripe_subscription_id) {
    return NextResponse.json({ billingPortalUrl: null });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${request.headers.get("origin")}`,
  });

  return NextResponse.json({ billingPortalUrl: portalSession.url });
}
