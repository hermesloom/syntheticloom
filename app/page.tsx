"use client";

import React, { useState, useEffect } from "react";
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

const initialCode = `//& ui: chat
//& title: What should I explain?

export async function main(loom: SyntheticLoom) {
  while (true) {
    const prompt = await loom.chat.prompt();
    const response = await loom.llm.ask("Explain the following: " + prompt);
    await loom.chat.respond(response);
  }
}`;

export default function Home() {
  const { session } = useSession();
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

  const handleAvatarClick = () => {
    if (session) {
      onAccountOpen();
    } else {
      onAuthOpen();
    }
  };

  useEffect(() => {
    if (session && isAuthOpen) {
      onAuthClose();
    }
    if (!session && isAccountOpen) {
      onAccountClose();
    }
  }, [session]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar className="border-b w-full h-12" maxWidth="full">
        <NavbarBrand>
          <p className="font-bold text-l">Synthetic Loom</p>
        </NavbarBrand>
        <NavbarContent justify="end">
          {session ? (
            <Button isIconOnly variant="light" onClick={handleAvatarClick}>
              <Avatar
                size="sm"
                showFallback
                name={session.user.email?.[0].toUpperCase()}
              />
            </Button>
          ) : (
            <Button color="primary" size="sm" onClick={onAuthOpen}>
              Sign in
            </Button>
          )}
        </NavbarContent>
      </Navbar>

      <div className="flex flex-1 h-[calc(100vh-3rem)]">
        <div className="w-1/2 border-r p-4">
          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter your loomx here..."
            classNames={{
              input:
                "font-mono whitespace-pre overflow-x-scroll scrollbar-thin",
              base: "w-full h-full min-h-[calc(100%-1rem)]",
            }}
            style={{
              overflowX: "auto",
            }}
            disableAutosize
            rows={999}
          />
        </div>
        <div className="w-1/2 p-4">
          <div className="bg-gray-100 h-full rounded-lg p-4">Content Area</div>
        </div>
      </div>

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
