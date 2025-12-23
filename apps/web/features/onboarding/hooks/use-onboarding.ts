"use client";

import { useOnborda } from "onborda";
import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "onboarding-completed";
const COMPLETE_EVENT = "onboarding-complete";

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

	// 同一タブからの完了イベントを検知
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

export function useOnboarding() {
	const { currentStep } = useOnborda();
	const isCompleted = useSyncExternalStore(
		subscribe,
		getSnapshot,
		getServerSnapshot,
	);

	const complete = useCallback(() => {
		try {
			localStorage.setItem(STORAGE_KEY, "true");
			// 同一タブで再レンダリングをトリガーし、onbordaを閉じるためカスタムイベントを発火
			window.dispatchEvent(new Event(COMPLETE_EVENT));
		} catch {
			// localStorage が無効な場合は無視
		}
	}, []);

	return {
		complete,
		currentStep,
		isCompleted,
		shouldShow: !isCompleted,
	};
}
