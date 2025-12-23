"use client";

import { useOnborda } from "onborda";
import { useCallback, useSyncExternalStore } from "react";
import { steps } from "../constants/steps";

const STORAGE_KEY = "onboarding-completed";
const COMPLETE_EVENT = "onboarding-complete";
const RESET_EVENT = "onboarding-reset";

export const TOUR_NAME = "main";
export const CUSTOMER_MENU_STEP_INDEX = 3;

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
	// 他タブからのストレージ変更を検知
	const handleStorageChange = (event: StorageEvent) => {
		if (event.key === STORAGE_KEY) {
			callback();
		}
	};

	// 同一タブからの完了/リセットイベントを検知
	const handleStateChange = () => {
		callback();
	};

	window.addEventListener("storage", handleStorageChange);
	window.addEventListener(COMPLETE_EVENT, handleStateChange);
	window.addEventListener(RESET_EVENT, handleStateChange);
	return () => {
		window.removeEventListener("storage", handleStorageChange);
		window.removeEventListener(COMPLETE_EVENT, handleStateChange);
		window.removeEventListener(RESET_EVENT, handleStateChange);
	};
}

export function useOnboarding() {
	const { currentStep, startOnborda, closeOnborda } = useOnborda();
	const isCompleted = useSyncExternalStore(
		subscribe,
		getSnapshot,
		getServerSnapshot,
	);

	const isLastStep = currentStep === steps.length - 1;
	const refreshHighlight = useCallback(() => {
		window.dispatchEvent(new Event("resize"));
	}, []);

	const complete = useCallback(() => {
		try {
			localStorage.setItem(STORAGE_KEY, "true");
			// 同一タブで再レンダリングをトリガー
			window.dispatchEvent(new Event(COMPLETE_EVENT));
		} catch {
			// localStorage が無効な場合は無視
		}
	}, []);

	const reset = useCallback(() => {
		try {
			localStorage.removeItem(STORAGE_KEY);
			// 同一タブで再レンダリングをトリガー
			window.dispatchEvent(new Event(RESET_EVENT));
			// ツアーを開始
			startOnborda(TOUR_NAME);
		} catch {
			// localStorage が無効な場合は無視
		}
	}, [startOnborda]);

	return {
		closeTour: closeOnborda,
		complete,
		currentStep,
		isCompleted,
		isLastStep,
		refreshHighlight,
		reset,
		shouldShow: !isCompleted,
		startTour: startOnborda,
	};
}
