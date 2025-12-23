import Link from "next/link";
import { Onboarding } from "@/features/onboarding/providers/onboarding-provider";
import { NavigationMenu } from "./_components/navigation-menu";
import { UserMenu } from "./_components/user-menu";

export default function PrivateLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<Onboarding>
			<div className="grid grid-rows-[auto_1fr] h-dvh">
				<header className="border-b grid grid-cols-[auto_1fr_auto] h-16 items-center gap-4 px-4">
					<NavigationMenu />
					<Link className="text-lg font-semibold hover:opacity-80" href="/">
						FORMAWORK.AI -CRM-
					</Link>
					<UserMenu />
				</header>
				<main className="overflow-y-auto [scrollbar-gutter:stable] bg-background">
					{children}
				</main>
			</div>
		</Onboarding>
	);
}
