import type React from "react";
import Link from "next/link";
import { Onboarding } from "@/features/onboarding/providers/onboarding-provider.client";
import { NavigationMenu } from "./_components/navigation-menu.client";
import { UserMenu } from "./_components/user-menu.client";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <Onboarding>
      <div className="grid h-dvh grid-rows-[auto_1fr]">
        <header className="grid h-16 grid-cols-[auto_1fr_auto] items-center gap-4 border-b px-4">
          <NavigationMenu />
          <Link className="text-lg font-semibold hover:opacity-80" href="/">
            FORMAWORK.AI -CRM-
          </Link>
          <UserMenu />
        </header>
        <main className="overflow-y-auto bg-background [scrollbar-gutter:stable]">
          {children}
        </main>
      </div>
    </Onboarding>
  );
}
