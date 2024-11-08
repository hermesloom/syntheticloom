"use client";

import { useEffect, useState } from "react";
import { Spinner } from "@nextui-org/spinner";
import { Input } from "@nextui-org/input";
import { useParams } from "next/navigation";

type ChatConfig = {
  interface: "chat";
  title: string;
};

interface RunConfig {
  content: string;
  apiKey: string;
  config: ChatConfig;
}

class SyntheticLoom {}

function parseConfig(content: string) {
  return content
    .split("\n")
    .filter((l) => l.startsWith("//&"))
    .map((l) => {
      const line = l.slice(3).trim();
      const colonIndex = line.indexOf(":");
      if (colonIndex === -1) {
        return;
      }
      return [
        line.slice(0, colonIndex).trim(),
        line.slice(colonIndex + 1).trim(),
      ];
    })
    .filter((x) => !!x)
    .reduce(
      (acc, [key, value]) => {
        acc[key] = value;
        return acc;
      },
      {} as { [key: string]: string }
    );
}

export default function RunPage() {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<RunConfig | null>(null);
  const params = useParams();

  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await fetch(`/api/run-config/${params.id}`);
        const data = await response.json();
        setConfig({ ...data, config: parseConfig(data.content) });
      } catch (error) {
        console.error("Failed to fetch config:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, [params.id]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (config?.config.interface === "chat") {
    return (
      <div className="mx-auto px-4 py-8 relative min-h-screen">
        <h1 className="text-4xl font-bold text-center mb-8">
          {config?.config.title}
        </h1>
        <div className="w-full flex justify-center">
          <Input
            type="text"
            placeholder="Type your message here..."
            size="lg"
            className="max-w-2xl"
            endContent={
              <button className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600">
                Send
              </button>
            }
          />
        </div>
        <div className="absolute bottom-4 right-4 text-xs text-gray-500">
          Made with{" "}
          <a
            href="https://syntheticloom.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600"
          >
            Synthetic Loom
          </a>
        </div>
      </div>
    );
  }

  return <div>Unknown UI type: {config?.config.ui}</div>;
}
