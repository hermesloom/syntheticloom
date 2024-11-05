"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Button, Spinner } from "@nextui-org/react";
import { useSession } from "./SessionContext";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface SubscriptionStatus {
  billingPortalUrl?: string;
}

export default function SubscribeButton() {
  const { session } = useSession();
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionStatus | null>(null);

  useEffect(() => {
    if (!session) {
      setCheckingStatus(false);
      return;
    }

    fetch("/api/subscription-status")
      .then((res) => res.json())
      .then((data) => {
        setSubscriptionStatus(data);
      })
      .finally(() => {
        setCheckingStatus(false);
      });
  }, [session]);

  const handleSubscribe = async () => {
    if (!session) return;

    setLoading(true);
    try {
      const stripe = await stripePromise;
      const response = await fetch("/api/create-checkout-session");
      const checkoutSession = await response.json();

      if (checkoutSession.id) {
        await stripe!.redirectToCheckout({ sessionId: checkoutSession.id });
      } else {
        console.error("Failed to create checkout session.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = () => {
    if (subscriptionStatus?.billingPortalUrl) {
      window.location.href = subscriptionStatus.billingPortalUrl;
    }
  };

  if (checkingStatus) {
    return <Spinner />;
  }

  if (subscriptionStatus?.billingPortalUrl) {
    return (
      <Button color="primary" onClick={handleManageSubscription}>
        Manage subscription
      </Button>
    );
  }

  return (
    <Button color="primary" onClick={handleSubscribe} isLoading={loading}>
      Subscribe for €20/month
    </Button>
  );
}
