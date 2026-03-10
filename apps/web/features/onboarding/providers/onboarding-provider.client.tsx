"use client";

import { Onborda, OnbordaProvider } from "onborda";
import { type ReactNode, useCallback, useEffect, useRef } from "react";
import { OnboardingCard } from "../components/onboarding-card.client";
import { steps } from "../constants/steps.universal";
import { TOUR_NAME, useOnboarding } from "../hooks/use-onboarding.hook";

type OnboardingWrapperProps = {
	children: ReactNode;
};

function OnboardingInner({ children }: { children: ReactNode }) {
	const { shouldShow, startTour, closeTour } = useOnboarding();
	const initializedRef = useRef(false);

	// オンボーディング開始（マウント時かつ未完了の場合）
	const initRef = useCallback(
		(node: HTMLDivElement | null) => {
			if (node && shouldShow && !initializedRef.current) {
				initializedRef.current = true;
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
			steps={[{ steps: steps, tour: TOUR_NAME }]}
		>
			<div ref={initRef}>{children}</div>
		</Onborda>
	);
}

export function Onboarding({ children }: OnboardingWrapperProps) {
	return (
		<OnbordaProvider>
			<OnboardingInner>{children}</OnboardingInner>
		</OnbordaProvider>
	);
}
