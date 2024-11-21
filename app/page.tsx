"use client";

import React, { useEffect } from "react";
import { Modal, ModalContent, ModalBody } from "@nextui-org/react";
import { redirect } from "next/navigation";
import Auth from "./_common/Auth";
import { useSession } from "./_common/SessionContext";

const initialCode = `//& interface: chat
//& title: What should I explain? (in development, not functional yet)

async function main(loom) {
  while (true) {
    const prompt = await loom.chat.prompt();
    const response = await loom.llm.ask("Explain the following: " + prompt);
    await loom.chat.respond(response);
  }
}`;

export default function Home() {
  const { session } = useSession();
  /*const [code, setCode] = useState(initialCode);
  const [currentlyRunningCode, setCurrentlyRunningCode] = useState<
    string | null
  >(null);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);*/

  useEffect(() => {
    if (session) {
      redirect("/project");
    }
  }, [session]);

  /*const debouncedRunCode = useCallback(
    debounce(async (codeToRun: string) => {
      try {
        if (!session) {
          return;
        }

        const response = await fetch("/api/upload-loomscript", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: codeToRun }),
        });

        if (!response.ok) {
          throw new Error("Failed to upload code");
        }

        const data = await response.json();
        setIframeUrl(data.url);
        setCurrentlyRunningCode(codeToRun);
      } catch (error) {
        console.error("Error uploading code:", error);
      }
    }, 1000),
    [session]
  );

  useEffect(() => {
    if (session && currentlyRunningCode !== code) {
      debouncedRunCode(code);
    }
    return () => {
      debouncedRunCode.cancel();
    };
  }, [session, currentlyRunningCode, code, debouncedRunCode]);*/

  return (
    <Modal
      isOpen
      classNames={{
        base: "m-0",
        wrapper: "items-center",
      }}
    >
      <ModalContent className="m-4">
        <ModalBody>
          <Auth />
        </ModalBody>
      </ModalContent>
    </Modal>
  );

  {
    /*session ? (
        <div className="flex flex-1 h-[calc(100vh-3rem)]">
          <div className="w-1/2 border-r p-4 flex flex-col">
            <Textarea
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
              }}
              placeholder="Enter your LoomScript here..."
              classNames={{
                input:
                  "font-mono whitespace-pre overflow-x-scroll scrollbar-thin",
                base: "w-full h-full",
              }}
              style={{
                overflowX: "auto",
              }}
              disableAutosize
              rows={999}
            />
          </div>
          <div className="w-1/2 p-4 flex flex-col">
            {iframeUrl ? (
              <>
                <iframe
                  src={iframeUrl}
                  className="w-full flex-1 rounded-lg"
                  frameBorder="0"
                />
                <Button
                  variant="bordered"
                  color={isCopied ? "success" : "default"}
                  className="mt-2 w-full"
                  onClick={async () => {
                    if (!isCopied) {
                      await navigator.clipboard.writeText(iframeUrl);
                      setIsCopied(true);
                      setTimeout(() => {
                        setIsCopied(false);
                      }, 2000);
                    }
                  }}
                >
                  {isCopied ? "Copied to clipboard" : "Share"}
                </Button>
              </>
            ) : (
              <div className="bg-gray-100 h-full rounded-lg p-4 flex items-center justify-center text-gray-500">
                Just a moment...
              </div>
            )}
          </div>
        </div>
      ) : null*/
  }
}
