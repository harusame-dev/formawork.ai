import { Button } from "@workspace/ui/components/button";
import { Menu } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { NavigationShell } from "./_components/navigation-shell.server";
import { UserMenu } from "./_components/user-menu.client";

export default function PrivateLayout({ children }: LayoutProps<"/">) {
	return (
		<div className="grid grid-rows-[auto_1fr] h-dvh">
			<header className="border-b grid grid-cols-[auto_1fr_auto] h-16 items-center gap-4 px-4">
				<Suspense
					fallback={
						<Button disabled size="icon" variant="ghost">
							<Menu className="size-6" />
							<span className="sr-only">メニューを開く</span>
						</Button>
					}
				>
					<NavigationShell />
				</Suspense>
				<Link className="text-lg font-semibold hover:opacity-80" href="/">
					お見送りサポートチャット
				</Link>
				<div className="justify-self-end">
					<UserMenu />
				</div>
			</header>
			<main className="overflow-y-auto [scrollbar-gutter:stable] bg-background">
				{children}
			</main>
		</div>
	);
}
