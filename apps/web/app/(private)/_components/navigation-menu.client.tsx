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
import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";

const ADMIN_LINKS: { href: Route; label: string }[] = [
	{ href: "/", label: "トップページ" },
	{ href: "/organizations", label: "組織一覧" },
	{ href: "/users", label: "ユーザー一覧" },
	{ href: "/chat-history", label: "全チャット履歴" },
];

export function NavigationMenu() {
	const [open, setOpen] = useState(false);

	return (
		<Sheet onOpenChange={setOpen} open={open}>
			<SheetTrigger asChild>
				<Button size="icon" variant="ghost">
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
						{ADMIN_LINKS.map((link) => (
							<li key={link.href}>
								<Link
									className="block rounded-md px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
									href={link.href}
									onClick={() => setOpen(false)}
								>
									{link.label}
								</Link>
							</li>
						))}
					</ul>
				</nav>
			</SheetContent>
		</Sheet>
	);
}
