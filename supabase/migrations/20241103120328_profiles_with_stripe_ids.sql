-- Add Stripe fields for subscription management
alter table profiles
  add column stripe_customer_id text,
  add column stripe_subscription_id text;
