"use client";

import { Button } from "@workspace/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { HelpCircle, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogoutButton } from "@/features/auth/logout/logout-button";
import { useOnboarding } from "@/features/onboarding/hooks/use-onboarding";

export function UserMenu() {
	const router = useRouter();
	const { reset } = useOnboarding();

	function handleStartTour() {
		router.push("/");
		// ナビゲーション後にリセット
		setTimeout(() => {
			reset();
		}, 100);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button size="icon" variant="ghost">
					<User className="size-6" />
					<span className="sr-only">ユーザーメニューを開く</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem asChild>
					<Link href="/settings/password">パスワード変更</Link>
				</DropdownMenuItem>
				<DropdownMenuItem onClick={handleStartTour}>
					<HelpCircle className="size-4 mr-2" />
					使い方ガイド
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<LogoutButton />
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
