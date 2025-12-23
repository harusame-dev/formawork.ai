"use client";

import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@workspace/ui/components/card";
import { X } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import type { CardComponentProps } from "onborda";
import { useOnboarding } from "../hooks/use-onboarding";

const MENU_BUTTON_STEP_INDEX = 2;
const CUSTOMER_SELECT_STEP_INDEX = 5;
const BASIC_INFO_STEP_INDEX = 6;
const NOTES_STEP_INDEX = 7;

export function OnboardingCard({
	step,
	currentStep,
	totalSteps,
	nextStep,
	prevStep,
	arrow,
}: CardComponentProps) {
	const router = useRouter();
	const { complete } = useOnboarding();
	const isFirstStep = currentStep === 0;
	const isLastStep = currentStep === totalSteps - 1;

	function handleSkip() {
		complete();
	}

	function handleComplete() {
		complete();
	}

	function handlePrev() {
		// Handle navigation for steps with prevRoute
		if (step.prevRoute) {
			router.push(step.prevRoute as Route);
			// Wait for page navigation to complete before moving to previous step
			setTimeout(() => {
				prevStep();
			}, 500);
			return;
		}

		prevStep();
	}

	function handleNext() {
		if (isLastStep) {
			handleComplete();
			return;
		}

		if (currentStep === MENU_BUTTON_STEP_INDEX) {
			window.dispatchEvent(new CustomEvent("onboarding-open-menu"));
			setTimeout(() => {
				nextStep();
			}, 550);
			return;
		}

		// Handle customer select step - navigate to the first customer's detail page
		if (currentStep === CUSTOMER_SELECT_STEP_INDEX) {
			const firstCustomerLink = document.getElementById(
				"onboarding-first-customer",
			) as HTMLAnchorElement | null;
			if (firstCustomerLink?.href) {
				router.push(firstCustomerLink.href as Route);
				setTimeout(() => {
					nextStep();
				}, 500);
				return;
			}
		}

		// Handle basic info step - navigate to the notes page
		if (currentStep === BASIC_INFO_STEP_INDEX) {
			const notesTabLink = document.getElementById(
				"onboarding-notes-tab",
			) as HTMLAnchorElement | null;
			if (notesTabLink?.href) {
				router.push(notesTabLink.href as Route);
				setTimeout(() => {
					nextStep();
				}, 500);
				return;
			}
		}

		// Handle notes step - navigate to the memories page
		if (currentStep === NOTES_STEP_INDEX) {
			const memoriesTabLink = document.getElementById(
				"onboarding-memories-tab",
			) as HTMLAnchorElement | null;
			if (memoriesTabLink?.href) {
				router.push(memoriesTabLink.href as Route);
				setTimeout(() => {
					nextStep();
				}, 500);
				return;
			}
		}

		// Handle navigation for steps with nextRoute
		if (step.nextRoute) {
			// Close any open menus/sheets before navigating
			window.dispatchEvent(new CustomEvent("onboarding-close-menu"));
			router.push(step.nextRoute as Route);
			// Wait for page navigation to complete before moving to next step
			setTimeout(() => {
				nextStep();
			}, 500);
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
						onClick={handleSkip}
						size="icon"
						variant="ghost"
					>
						<X className="h-4 w-4" />
					</Button>
				</div>
				<p className="text-sm text-muted-foreground">
					ステップ {currentStep + 1} / {totalSteps}
				</p>
			</CardHeader>
			<CardContent className="pb-4">
				<div className="text-sm">{step.content}</div>
			</CardContent>
			<CardFooter className="flex justify-between pt-0">
				{!isFirstStep ? (
					<Button onClick={handlePrev} size="sm" variant="outline">
						戻る
					</Button>
				) : (
					<div />
				)}
				<Button onClick={handleNext} size="sm">
					{isLastStep ? "完了" : "次へ"}
				</Button>
			</CardFooter>
			{arrow}
		</Card>
	);
}
