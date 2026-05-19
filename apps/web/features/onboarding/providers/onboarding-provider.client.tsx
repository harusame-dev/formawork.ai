"use client";

import type React from "react";
import { Onborda, OnbordaProvider } from "onborda";
import { type ReactNode, useCallback, useEffect, useRef } from "react";
import { OnboardingCard } from "@/features/onboarding/components/onboarding-card.client";
import { steps } from "@/features/onboarding/constants/steps.universal";
import {
  TOUR_NAME,
  useOnboarding,
} from "@/features/onboarding/hooks/use-onboarding.hook";

interface OnboardingWrapperProps {
  children: ReactNode;
}

function OnboardingInner({ children }: { children: ReactNode }): React.JSX.Element {
  const { shouldShow, startTour, closeTour } = useOnboarding();
  const initializedReference = useRef(false);

  // オンボーディング開始（マウント時かつ未完了の場合）
  const initReference = useCallback(
    (node: HTMLDivElement | null) => {
      if (node && shouldShow && !initializedReference.current) {
        initializedReference.current = true;
        startTour(TOUR_NAME);
      }
    },
    [shouldShow, startTour],
  );

  // 完了時にonbordaを閉じる
  useEffect(() => {
    if (!shouldShow) {
      closeTour();
    }
  }, [shouldShow, closeTour]);

  return (
    <Onborda
      cardComponent={OnboardingCard}
      cardTransition={{ duration: 0.6, type: "spring" }}
      shadowOpacity="0.5"
      shadowRgb="0,0,0"
      showOnborda={shouldShow}
      steps={[{ steps, tour: TOUR_NAME }]}
    >
      <div ref={initReference}>{children}</div>
    </Onborda>
  );
}

export function Onboarding({ children }: OnboardingWrapperProps): React.JSX.Element {
  return (
    <OnbordaProvider>
      <OnboardingInner>{children}</OnboardingInner>
    </OnbordaProvider>
  );
}
