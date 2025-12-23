"use client";

import { Button } from "@workspace/ui/components/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@workspace/ui/components/sheet";
import { Menu } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { OnboardingId } from "@/features/onboarding/constants/steps";
import {
	CUSTOMER_MENU_STEP_INDEX,
	useOnboarding,
} from "@/features/onboarding/hooks/use-onboarding";

export function NavigationMenu() {
	const { currentStep, refreshHighlight } = useOnboarding();
	const [open, setOpen] = useState(false);

	// オンボーディングのステップに応じてメニューを開閉
	useEffect(() => {
		let timeoutId: ReturnType<typeof setTimeout> | undefined;

		if (currentStep === CUSTOMER_MENU_STEP_INDEX) {
			setOpen(true);
			// シートが開き切った後にハイライトのサイズを修正するために resize イベント発行
			timeoutId = setTimeout(() => {
				refreshHighlight();
			}, 550);
		}

		return () => {
			clearTimeout(timeoutId);
		};
	}, [currentStep, refreshHighlight]);

	return (
		<Sheet onOpenChange={setOpen} open={open}>
			<SheetTrigger asChild>
				<Button id={OnboardingId.MenuButton} size="icon" variant="ghost">
					<Menu className="size-6" />
					<span className="sr-only">メニューを開く</span>
				</Button>
			</SheetTrigger>
			<SheetContent side="left">
				<SheetHeader>
					<SheetTitle>メニュー</SheetTitle>
				</SheetHeader>
				<nav className="mt-6">
					<ul className="space-y-2">
						<li>
							<Link
								className="block rounded-md px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
								href="/customers"
								id={OnboardingId.CustomerMenu}
								onClick={() => setOpen(false)}
							>
								顧客一覧
							</Link>
						</li>
						<li>
							<Link
								className="block rounded-md px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
								href="/staffs"
								onClick={() => setOpen(false)}
							>
								スタッフ一覧
							</Link>
						</li>
					</ul>
				</nav>
			</SheetContent>
		</Sheet>
	);
}
