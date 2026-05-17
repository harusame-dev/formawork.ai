import { Button } from "@workspace/ui/components/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import * as v from "valibot";
import { usersConditionSchema } from "@/features/user/list/schema";
import { UsersContainer } from "@/features/user/list/users.server";
import { UsersSkeleton } from "@/features/user/list/users-skeleton.universal";

export default function Page({ searchParams }: PageProps<"/users">) {
	const condition = searchParams.then((params) =>
		v.parse(usersConditionSchema, {
			page: typeof params["page"] === "string" ? params["page"] : 1,
		}),
	);

	return (
		<div className="container mx-auto p-4 flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-semibold">ユーザー一覧</h1>
				<Button asChild>
					<Link href="/users/new">
						<Plus className="size-4" />
						ユーザーを登録
					</Link>
				</Button>
			</div>
			<Suspense fallback={<UsersSkeleton />}>
				<UsersContainer condition={condition} />
			</Suspense>
		</div>
	);
}
