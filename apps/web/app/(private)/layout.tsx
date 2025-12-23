import { OnboardingWrapper } from "@/features/onboarding/providers/onboarding-provider";
import { NavigationMenu } from "./_components/navigation-menu";
import { UserMenu } from "./_components/user-menu";

export default function PrivateLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<OnboardingWrapper>
			<div className="grid grid-rows-[auto_1fr] h-dvh">
				<header className="border-b grid grid-cols-[auto_1fr_auto] h-16 items-center gap-4 px-4">
					<NavigationMenu />
					<span className="text-lg font-semibold">FORMAWORK.AI -CRM-</span>
					<UserMenu />
				</header>
				<main className="overflow-y-auto [scrollbar-gutter:stable] bg-background">
					{children}
				</main>
			</div>
		</OnboardingWrapper>
	);
}
