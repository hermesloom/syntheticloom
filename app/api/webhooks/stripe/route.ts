import Stripe from "stripe";
import { NextResponse } from "next/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";

const relevantEvents = new Set([
  "checkout.session.completed",
  "invoice.payment_succeeded",
  "customer.subscription.deleted",
]);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function getCustomerUUID(
  supabase: SupabaseClient,
  stripeCustomerId: string
): Promise<string> {
  const { data: customerData, error: noCustomerError } = await supabase
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", stripeCustomerId)
    .single();

  if (noCustomerError) {
    console.error(`Customer lookup failed: ${noCustomerError.message}`);
    throw new Error(`Customer lookup failed: ${noCustomerError.message}`);
  }

  return customerData.id;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret) {
      return NextResponse.json(
        { error: "Webhook secret not found." },
        { status: 400 }
      );
    }
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          const userId = await getCustomerUUID(
            supabase,
            session.customer as string
          );
          const subscriptionId = session.subscription;

          // Update profile with subscription ID
          await supabase
            .from("profiles")
            .update({ stripe_subscription_id: subscriptionId })
            .eq("id", userId);
          console.log(
            `Updated profile of user ${userId} with subscription ID: ${subscriptionId}`
          );
          break;
        }
        case "invoice.payment_succeeded": {
          console.log(`Handling invoice.payment_succeeded`);
          break;
        }
        case "customer.subscription.deleted": {
          const subscription = event.data.object;
          const userId = await getCustomerUUID(
            supabase,
            subscription.customer as string
          );
          const currentSubscriptionId = (
            await supabase
              .from("profiles")
              .select("stripe_subscription_id")
              .eq("id", userId)
              .single()
          ).data?.stripe_subscription_id;

          if (currentSubscriptionId === subscription.id) {
            await supabase
              .from("profiles")
              .update({ stripe_subscription_id: null })
              .eq("id", userId);
            console.log(
              `Updated profile of user ${userId} with null subscription ID`
            );
          } else {
            throw new Error(
              `Subscription ${subscription.id} not found for user ${userId}`
            );
          }

          break;
        }
        default: {
          throw new Error("Unhandled relevant event!");
        }
      }
    } catch (error) {
      console.error(`Error handling event: ${event.type}`, error);
      return NextResponse.json(
        { error: "Webhook handler failed. View your Next.js function logs." },
        { status: 400 }
      );
    }
  } else {
    return NextResponse.json(
      { error: `Unsupported event type: ${event.type}` },
      { status: 400 }
    );
  }
  return NextResponse.json({ received: true }, { status: 200 });
}
