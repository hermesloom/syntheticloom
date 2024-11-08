import { useState } from "react";
import { Button, Input, Tabs, Tab } from "@nextui-org/react";
import { createClient } from "@/utils/supabase/client";
import { useSession } from "./SessionContext";
import { ApiKey } from "./ApiKey";
import { ApiCredits } from "./ApiCredits";

export default function Account() {
  const supabase = createClient();
  const { session } = useSession();
  const [selectedTab, setSelectedTab] = useState("account");

  return (
    <div className="min-h-[600px] px-10 py-10">
      <div className="w-full max-w-5xl mx-auto space-y-6">
        {/* Tabs at the top */}
        <Tabs
          aria-label="Settings"
          selectedKey={selectedTab}
          onSelectionChange={(key) => setSelectedTab(key.toString())}
          className="w-full"
        >
          <Tab key="account" title="Account" />
          <Tab key="credits" title="Credits" />
          <Tab key="apikeys" title="API Keys" />
        </Tabs>

        {/* Content area */}
        <div className="w-full">
          {selectedTab === "account" && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold">Account</h1>
                <p className="text-sm text-default-500">
                  Manage your account settings and preferences.
                </p>
              </div>

              <div className="space-y-4">
                <Input
                  type="email"
                  label="Email address"
                  value={session?.user.email}
                  isDisabled
                  variant="bordered"
                  size="lg"
                />

                <Button
                  color="danger"
                  onClick={() => supabase.auth.signOut()}
                  size="lg"
                  className="w-full font-medium"
                >
                  Sign out
                </Button>
              </div>
            </div>
          )}

          {selectedTab === "credits" && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold">Credits</h1>
                <p className="text-sm text-default-500">
                  Manage your credits for using Synthetic Loom.
                </p>
              </div>
              <ApiCredits />
            </div>
          )}

          {selectedTab === "apikeys" && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold">API</h1>
                <p className="text-sm text-default-500">
                  Manage the API for accessing Synthetic Loom.
                </p>
              </div>
              <ApiKey />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
