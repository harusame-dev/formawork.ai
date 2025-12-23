"use client";

import { Onborda, OnbordaProvider, useOnborda } from "onborda";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { OnboardingCard } from "../components/onboarding-card";
import { onboardingSteps } from "../constants/steps";
import { useOnboarding } from "../hooks/use-onboarding";

const TOUR_NAME = "main";
const COMPLETE_EVENT = "onboarding-complete";

type OnboardingWrapperProps = {
	children: ReactNode;
};

function OnboardingController({ children }: { children: ReactNode }) {
	const { shouldShow } = useOnboarding();
	const { startOnborda, closeOnborda } = useOnborda();

	// オンボーディング開始
	useEffect(() => {
		if (shouldShow) {
			startOnborda(TOUR_NAME);
		}
	}, [shouldShow, startOnborda]);

	// 完了イベントを受け取ったらonbordaを閉じる
	useEffect(() => {
		function handleComplete() {
			closeOnborda();
		}

		window.addEventListener(COMPLETE_EVENT, handleComplete);
		return () => window.removeEventListener(COMPLETE_EVENT, handleComplete);
	}, [closeOnborda]);

	return <>{children}</>;
}

export function OnboardingWrapper({ children }: OnboardingWrapperProps) {
	const { shouldShow } = useOnboarding();

	return (
		<OnbordaProvider>
			<Onborda
				cardComponent={OnboardingCard}
				cardTransition={{ duration: 0.3, type: "spring" }}
				shadowOpacity="0.5"
				shadowRgb="0,0,0"
				showOnborda={shouldShow}
				steps={[{ steps: onboardingSteps, tour: TOUR_NAME }]}
			>
				<OnboardingController>{children}</OnboardingController>
			</Onborda>
		</OnbordaProvider>
	);
}
