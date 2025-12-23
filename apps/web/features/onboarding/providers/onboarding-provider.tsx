"use client";

import { Onborda, OnbordaProvider, useOnborda } from "onborda";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { OnboardingCard } from "../components/onboarding-card";
import { onboardingSteps } from "../constants/steps";
import { useOnboarding } from "../hooks/use-onboarding";

type OnboardingWrapperProps = {
	children: ReactNode;
};

function OnboardingStarter({ children }: { children: ReactNode }) {
	const { shouldShow } = useOnboarding();
	const { startOnborda } = useOnborda();

	useEffect(() => {
		if (shouldShow) {
			startOnborda("main");
		}
	}, [shouldShow, startOnborda]);

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
				steps={[{ steps: onboardingSteps, tour: "main" }]}
			>
				<OnboardingStarter>{children}</OnboardingStarter>
			</Onborda>
		</OnbordaProvider>
	);
}
