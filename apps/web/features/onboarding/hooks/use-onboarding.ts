"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "onboarding-completed";

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

	window.addEventListener("storage", handleStorageChange);
	return () => window.removeEventListener("storage", handleStorageChange);
}

export function useOnboarding() {
	const isCompleted = useSyncExternalStore(
		subscribe,
		getSnapshot,
		getServerSnapshot,
	);

	const complete = useCallback(() => {
		try {
			localStorage.setItem(STORAGE_KEY, "true");
		} catch {
			// localStorage が無効な場合は無視
		}
	}, []);

	return {
		complete,
		isCompleted,
		shouldShow: !isCompleted,
	};
}
