-- Add a new column to the profiles table to track API credits
alter table profiles
  add column api_credits integer default 10000;

comment on column profiles.api_credits is 'The number of API credits available to the user. 1,000,000 API credits = 1 euro';
