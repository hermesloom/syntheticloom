"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  Avatar,
  Modal,
  ModalContent,
  ModalBody,
  useDisclosure,
  Button,
  Textarea,
} from "@nextui-org/react";
import Auth from "./_common/Auth";
import { useSession } from "./_common/SessionContext";
import Account from "./_common/Account";
import debounce from "lodash/debounce";

const initialCode = `//& interface: chat
//& title: What should I explain?

async function main(loom) {
  while (true) {
    const prompt = await loom.chat.prompt();
    const response = await loom.llm.ask("Explain the following: " + prompt);
    await loom.chat.respond(response);
  }
}`;

export default function Home() {
  const { session, isLoading: sessionLoading } = useSession();
  const {
    isOpen: isAuthOpen,
    onOpen: onAuthOpen,
    onClose: onAuthClose,
  } = useDisclosure();
  const {
    isOpen: isAccountOpen,
    onOpen: onAccountOpen,
    onClose: onAccountClose,
  } = useDisclosure();
  const [code, setCode] = useState(initialCode);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!session && !sessionLoading) {
      onAuthOpen();
    }
  }, [session, sessionLoading, onAuthOpen]);

  useEffect(() => {
    if (session && isAuthOpen) {
      onAuthClose();
    }
    if (!session && isAccountOpen) {
      onAccountClose();
    }
  }, [session]);

  const debouncedRunCode = useCallback(
    debounce(async (codeToRun: string) => {
      try {
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
      } catch (error) {
        console.error("Error uploading code:", error);
      }
    }, 1000),
    []
  );

  useEffect(() => {
    debouncedRunCode(code);
    return () => {
      debouncedRunCode.cancel();
    };
  }, [code, debouncedRunCode]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar className="border-b w-full h-12" maxWidth="full">
        <NavbarBrand>
          <p className="font-bold text-l">Synthetic Loom</p>
        </NavbarBrand>
        <NavbarContent justify="end">
          {session ? (
            <Button isIconOnly variant="light" onClick={onAccountOpen}>
              <Avatar
                size="sm"
                showFallback
                name={session.user.email?.[0].toUpperCase()}
              />
            </Button>
          ) : null}
        </NavbarContent>
      </Navbar>

      {session ? (
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
      ) : null}

      <Modal
        isOpen={isAuthOpen}
        onClose={onAuthClose}
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

      <Modal
        isOpen={isAccountOpen}
        onClose={onAccountClose}
        size="2xl"
        classNames={{
          base: "m-0",
          wrapper: "items-center",
        }}
      >
        <ModalContent className="m-4">
          <ModalBody>
            <Account />
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
