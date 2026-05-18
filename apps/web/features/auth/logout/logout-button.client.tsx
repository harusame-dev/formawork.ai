"use client";

import { Button } from "@workspace/ui/components/button";
import { useTransition } from "react";
import { logoutAction } from "./logout.action";

export function LogoutButton(): JSX.Element {
  const [isPending, startTransition] = useTransition();

  const handleOnClick = (): void => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <Button
      className="w-full justify-start"
      isProcessing={isPending}
      onClick={handleOnClick}
      processingLabel="ログアウト中"
      variant="ghost"
    >
      ログアウト
    </Button>
  );
}
