import Link from "next/link";
import { NavigationMenu } from "./_components/navigation-menu.client";
import { UserMenu } from "./_components/user-menu.client";

export default function PrivateLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="grid grid-rows-[auto_1fr] h-dvh">
			<header className="grid grid-cols-[auto_1fr_auto] h-16 items-center gap-4 px-4">
				<NavigationMenu />
				<Link className="text-lg font-semibold hover:opacity-80" href="/events">
					ボランティア管理
				</Link>
				<UserMenu />
			</header>
			<main className="overflow-y-auto [scrollbar-gutter:stable] bg-background">
				{children}
			</main>
		</div>
	);
}
