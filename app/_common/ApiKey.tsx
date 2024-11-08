"use client";

import { useEffect, useState } from "react";
import { Button, Input, Tooltip } from "@nextui-org/react";
import { CopyOutlined, CheckOutlined } from "@ant-design/icons";

export function ApiKey() {
  const [apiKey, setApiKey] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchApiKey = async (generateNew: boolean = false) => {
    try {
      setIsLoading(true);
      const url = generateNew
        ? "/api/api-key?generate_new=true"
        : "/api/api-key";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch API key");
      const data = await response.json();
      setApiKey(data.apiKey);
      setConfirmRegenerate(false);
    } catch (error) {
      console.error("Error fetching API key:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKey();
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleRegenerateClick = () => {
    if (confirmRegenerate) {
      fetchApiKey(true);
    } else {
      setConfirmRegenerate(true);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          id="api-key"
          value={isLoading ? "Loading..." : apiKey.slice(0, 20) + "..."}
          readOnly
          label="API Key"
          variant="bordered"
          size="lg"
          classNames={{
            input: "font-mono",
          }}
          endContent={
            <Tooltip content="Copy to clipboard">
              <Button
                isIconOnly
                variant="light"
                onClick={copyToClipboard}
                className="min-w-unit-8"
                isLoading={isLoading}
              >
                {copied ? (
                  <CheckOutlined style={{ color: "#22c55e" }} />
                ) : (
                  <CopyOutlined />
                )}
              </Button>
            </Tooltip>
          }
        />
      </div>
      <Button
        color={confirmRegenerate ? "danger" : "primary"}
        onClick={handleRegenerateClick}
        isLoading={isLoading}
        isDisabled={isLoading}
        size="lg"
        className="w-full font-medium"
      >
        {isLoading
          ? "Regenerating..."
          : confirmRegenerate
            ? "This will invalidate the current API key. Click to confirm."
            : "Regenerate API key"}
      </Button>
    </div>
  );
}
