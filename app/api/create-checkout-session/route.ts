import Stripe from "stripe";
import { requestWithAuth } from "../_common/endpoints";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const GET = requestWithAuth(async (supabase, user, request) => {
  // Fetch the user's profile from Supabase
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user?.id)
    .single();

  if (error) {
    throw new Error("User not found");
  }

  // Create Stripe customer if not existing
  let customerId = profile.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      metadata: { supabase_user_id: user!.id },
    });
    customerId = customer.id;

    // Store the customer ID in Supabase
    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user?.id);
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
    success_url: request.headers.get("referer")!,
    cancel_url: request.headers.get("referer")!,
  });

  return { id: session.id };
});
