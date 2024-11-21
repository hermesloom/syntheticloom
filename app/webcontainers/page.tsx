"use client";

import { useState, useEffect } from "react";
import { WebContainer } from "@webcontainer/api";

export default function WebContainersDemo() {
  const [serverUrl, setServerUrl] = useState<string>("");
  const [webcontainerInstance, setWebcontainerInstance] =
    useState<WebContainer | null>(null);

  useEffect(() => {
    async function bootWebContainer() {
      try {
        // Initialize the WebContainer
        const instance = await WebContainer.boot();
        setWebcontainerInstance(instance);

        const runtime = await (await fetch("/api/runtime")).arrayBuffer();
        await instance.mount(runtime);

        const installProcess = await instance.spawn("npm", ["install"]);
        const installExitCode = await installProcess.exit;
        if (installExitCode !== 0) {
          throw new Error("Unable to run npm install");
        }

        // Run the file
        const runProcess = await instance.spawn("npm", ["run", "dev"]);
        runProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              console.log(data);
            },
          })
        );

        instance.on("server-ready", (port, url) => {
          console.log(port, url);
          setServerUrl(url);
        });
      } catch (error) {
        console.error("Failed to boot WebContainer:", error);
      }
    }

    bootWebContainer();

    // Cleanup
    return () => {
      if (webcontainerInstance) {
        webcontainerInstance.teardown();
        setWebcontainerInstance(null);
        setServerUrl("");
      }
    };
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">WebContainers Demo</h1>
      {serverUrl && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Preview:</h2>
          <iframe
            src={serverUrl}
            className="w-full h-[600px] border rounded-lg"
            title="WebContainer Preview"
          />
        </div>
      )}
    </div>
  );
}
