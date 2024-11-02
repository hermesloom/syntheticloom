"use client";

import * as React from "react";
import { NextUIProvider } from "@nextui-org/system";
import { useRouter } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "./_common/SessionContext";

export interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const router = useRouter();

  return (
    <NextUIProvider navigate={router.push}>
      <SessionProvider>{children}</SessionProvider>
    </NextUIProvider>
  );

  // ThemeProvider seems to be buggy, because it always uses dark mode
  return (
    <NextUIProvider navigate={router.push}>
      <ThemeProvider>{children}</ThemeProvider>
    </NextUIProvider>
  );
}
