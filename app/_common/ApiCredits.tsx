"use client";

import { useEffect, useState } from "react";
import { Button, Tooltip, Input } from "@nextui-org/react";
import { ReloadOutlined } from "@ant-design/icons";

export function ApiCredits() {
  const [credits, setCredits] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuying, setIsBuying] = useState(false);

  const fetchCredits = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/api-credits");
      if (!response.ok) throw new Error("Failed to fetch API credits");
      const data = await response.json();
      setCredits(data.apiCredits);
    } catch (error) {
      console.error("Error fetching API credits:", error);
      setCredits(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyCredits = async () => {
    try {
      setIsBuying(true);
      const response = await fetch("/api/buy-api-credits");
      if (!response.ok) throw new Error("Failed to create checkout session");
      const data = await response.json();
      window.location.href = data.url;
    } catch (error) {
      console.error("Error creating checkout session:", error);
    } finally {
      setIsBuying(false);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          label="Available Credits"
          value={
            isLoading
              ? "Loading..."
              : credits === null
                ? "Error loading credits"
                : credits.toString()
          }
          readOnly
          variant="bordered"
          size="lg"
          endContent={
            <Tooltip content="Refresh">
              <Button
                isIconOnly
                variant="light"
                onClick={fetchCredits}
                isLoading={isLoading}
                className="min-w-unit-8"
              >
                <ReloadOutlined />
              </Button>
            </Tooltip>
          }
        />
      </div>
      <Button
        color="primary"
        onClick={handleBuyCredits}
        isLoading={isBuying}
        isDisabled={isBuying}
        size="lg"
        className="w-full font-medium"
      >
        {isBuying ? "Redirecting to checkout..." : "Buy credits"}
      </Button>
    </div>
  );
}
