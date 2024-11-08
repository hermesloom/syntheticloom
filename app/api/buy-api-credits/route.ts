import Stripe from "stripe";
import { requestWithAuth } from "../_common/endpoints";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const GET = requestWithAuth(async (supabase, user, request) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price: "price_1QIelOBMG61myACDnz2W1s0I",
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: request.headers.get("referer")!,
    cancel_url: request.headers.get("referer")!,
    metadata: {
      supabase_user_id: user?.id,
    },
  });

  return { url: session.url };
});
