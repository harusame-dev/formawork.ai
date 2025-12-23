"use client";

import { Onborda, OnbordaProvider, useOnborda } from "onborda";
import type { ReactNode } from "react";
import { useEffect, useSyncExternalStore } from "react";
import { OnboardingCard } from "../components/onboarding-card";
import { onboardingSteps } from "../constants/steps";

const TOUR_NAME = "main";
const COMPLETE_EVENT = "onboarding-complete";
const STORAGE_KEY = "onboarding-completed";

type OnboardingWrapperProps = {
	children: ReactNode;
};

// Provider外でも使用可能な完了状態のチェック
function getSnapshot(): boolean {
	try {
		return localStorage.getItem(STORAGE_KEY) === "true";
	} catch {
		return false;
	}
}

function getServerSnapshot(): boolean {
	return false;
}

function subscribe(callback: () => void): () => void {
	const handleStorageChange = (event: StorageEvent) => {
		if (event.key === STORAGE_KEY) {
			callback();
		}
	};

	const handleCompleteEvent = () => {
		callback();
	};

	window.addEventListener("storage", handleStorageChange);
	window.addEventListener(COMPLETE_EVENT, handleCompleteEvent);
	return () => {
		window.removeEventListener("storage", handleStorageChange);
		window.removeEventListener(COMPLETE_EVENT, handleCompleteEvent);
	};
}

function OnboardingInner({ children }: { children: ReactNode }) {
	const isCompleted = useSyncExternalStore(
		subscribe,
		getSnapshot,
		getServerSnapshot,
	);
	const shouldShow = !isCompleted;

	return (
		<Onborda
			cardComponent={OnboardingCard}
			cardTransition={{ duration: 0.3, type: "spring" }}
			shadowOpacity="0.5"
			shadowRgb="0,0,0"
			showOnborda={shouldShow}
			steps={[{ steps: onboardingSteps, tour: TOUR_NAME }]}
		>
			<OnboardingController shouldShow={shouldShow}>
				{children}
			</OnboardingController>
		</Onborda>
	);
}

function OnboardingController({
	children,
	shouldShow,
}: {
	children: ReactNode;
	shouldShow: boolean;
}) {
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
	return (
		<OnbordaProvider>
			<OnboardingInner>{children}</OnboardingInner>
		</OnbordaProvider>
	);
}
