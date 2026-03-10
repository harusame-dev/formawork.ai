"use client";

import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@workspace/ui/components/card";
import { X } from "lucide-react";
import type { CardComponentProps } from "onborda";
import { useOnboarding } from "../hooks/use-onboarding.hook";

export function OnboardingCard({
	step,
	currentStep,
	totalSteps,
	nextStep,
	arrow,
}: CardComponentProps) {
	const { complete } = useOnboarding();
	const isLastStep = currentStep === totalSteps - 1;

	function handleNext() {
		if (isLastStep) {
			complete();
			return;
		}
		nextStep();
	}

	return (
		<Card className="w-80 border-primary/20 shadow-lg">
			<CardHeader className="pb-2">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<span className="text-xl">{step.icon}</span>
						<h3 className="font-semibold">{step.title}</h3>
					</div>
					<Button
						aria-label="スキップ"
						className="h-6 w-6"
						onClick={complete}
						size="icon"
						variant="ghost"
					>
						<X className="h-4 w-4" />
					</Button>
				</div>
			</CardHeader>
			<CardContent className="pb-2">
				<div className="text-sm">{step.content}</div>
			</CardContent>
			<CardFooter className="flex items-center justify-between pt-0">
				<span className="text-xs text-muted-foreground">
					{currentStep + 1} / {totalSteps}
				</span>
				<Button onClick={handleNext} size="sm">
					{isLastStep ? "完了" : "次へ"}
				</Button>
			</CardFooter>
			{arrow}
		</Card>
	);
}
