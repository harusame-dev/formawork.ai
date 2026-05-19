"use client";

import type React from "react";
import { Button } from "@workspace/ui/components/button";
import { HelpCircle } from "lucide-react";
import { useOnboarding } from "@/features/onboarding/hooks/use-onboarding.hook";

export function StartTourButton(): React.JSX.Element {
  const { reset } = useOnboarding();

  return (
    <Button onClick={reset} variant="outline">
      <HelpCircle className="mr-2 size-4" />
      使い方ガイドを見る
    </Button>
  );
}
