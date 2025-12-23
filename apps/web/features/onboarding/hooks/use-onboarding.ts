"use client";

import { useOnborda } from "onborda";
import { useCallback, useEffect, useSyncExternalStore } from "react";

const STORAGE_KEY = "onboarding-completed";
const COMPLETE_EVENT = "onboarding-complete";

// ステップインデックス定数
const CAUTION_STEP_INDEX = 1;
export const CUSTOMER_MENU_STEP_INDEX = 3;
const CUSTOMER_SELECT_STEP_INDEX = 5;
const BASIC_INFO_STEP_INDEX = 6;

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

	const refreshHighlight = useCallback(() => {
		window.dispatchEvent(new Event("resize"));
	}, []);

	const complete = useCallback(() => {
		try {
			localStorage.setItem(STORAGE_KEY, "true");
			// 同一タブで再レンダリングをトリガーし、onbordaを閉じるためカスタムイベントを発火
			window.dispatchEvent(new Event(COMPLETE_EVENT));
		} catch {
			// localStorage が無効な場合は無視
		}
	}, []);

	// ステップに応じてスクロールとハイライト位置を調整
	useEffect(() => {
		// ステップ2（ご注意）
		if (currentStep === CAUTION_STEP_INDEX) {
			const timeoutId = setTimeout(() => {
				const cautionElement = document.getElementById("onboarding-caution");
				if (cautionElement) {
					cautionElement.scrollIntoView({
						behavior: "instant",
						block: "start",
					});
					window.dispatchEvent(new Event("resize"));
				}
			}, 300);
			return () => clearTimeout(timeoutId);
		}

		// ステップ6（顧客を選択）
		if (currentStep === CUSTOMER_SELECT_STEP_INDEX) {
			const timeoutId = setTimeout(() => {
				const firstCustomerElement = document.getElementById(
					"onboarding-first-customer",
				);
				if (firstCustomerElement) {
					firstCustomerElement.scrollIntoView({
						behavior: "instant",
						block: "start",
					});
					window.dispatchEvent(new Event("resize"));
				}
			}, 300);
			return () => clearTimeout(timeoutId);
		}

		// ステップ7（基本情報）- フォーカス位置のみ調整
		if (currentStep === BASIC_INFO_STEP_INDEX) {
			const timeoutId = setTimeout(() => {
				window.dispatchEvent(new Event("resize"));
			}, 300);
			return () => clearTimeout(timeoutId);
		}
	}, [currentStep]);

	return {
		complete,
		currentStep,
		isCompleted,
		refreshHighlight,
		shouldShow: !isCompleted,
	};
}
