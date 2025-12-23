"use client";

import { Onborda, OnbordaProvider } from "onborda";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { OnboardingCard } from "../components/onboarding-card";
import { steps } from "../constants/steps";
import { TOUR_NAME, useOnboarding } from "../hooks/use-onboarding";

type OnboardingWrapperProps = {
	children: ReactNode;
};

function OnboardingInner({ children }: { children: ReactNode }) {
	const { shouldShow, startTour, closeTour } = useOnboarding();

	// オンボーディング開始（マウント時かつ未完了の場合）
	// biome-ignore lint/correctness/useExhaustiveDependencies: マウント時のみ実行
	useEffect(() => {
		if (shouldShow) {
			startTour(TOUR_NAME);
		}
	}, []);

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
			{children}
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
