import Stripe from "stripe";
import { requestWithAuth } from "../_common/endpoints";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const GET = requestWithAuth(async (supabase, user, request) => {
  // Fetch the user's profile from Supabase
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("stripe_customer_id,stripe_subscription_id")
    .eq("id", user.id)
    .single();

  if (error || !profile.stripe_subscription_id) {
    // TODO: when this is the case, also check the Stripe API whether the user is actually not subscribed
    // to mitigate webhook messages having been lost
    return { billingPortalUrl: null };
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${request.headers.get("referer")}`,
  });

  return { billingPortalUrl: portalSession.url };
});
