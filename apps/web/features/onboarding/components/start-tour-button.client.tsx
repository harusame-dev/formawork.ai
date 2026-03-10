"use client";

import { Button } from "@workspace/ui/components/button";
import { HelpCircle } from "lucide-react";
import { useOnboarding } from "../hooks/use-onboarding.hook";

export function StartTourButton() {
	const { reset } = useOnboarding();

	return (
		<Button onClick={reset} variant="outline">
			<HelpCircle className="size-4 mr-2" />
			使い方ガイドを見る
		</Button>
	);
}
