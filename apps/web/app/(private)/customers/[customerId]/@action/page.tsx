import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import Link from "next/link";
import { Suspense } from "react";
import { getUserRole, UserRole } from "@/features/auth/get-user-role";
import { DeleteCustomerDialog } from "@/features/customer/delete/delete-customer-dialog.client";

export default function Page({ params }: PageProps<"/customers/[customerId]">) {
	const customerIdPromise = params.then(({ customerId }) => customerId);

	return (
		<Suspense
			fallback={
				<div aria-busy className="flex gap-4 items-center">
					<span className="sr-only">操作読み込み中</span>
					<Skeleton aria-hidden className="h-4 w-8 bg-black/10" />
					<Button aria-hidden disabled size="sm">
						削除
					</Button>
				</div>
			}
		>
			<Action customerIdPromise={customerIdPromise} />
		</Suspense>
	);
}

async function Action({
	customerIdPromise,
}: {
	customerIdPromise: Promise<string>;
}) {
	const [customerId, userRole] = await Promise.all([
		customerIdPromise,
		getUserRole(),
	]);

	if (userRole !== UserRole.Admin) {
		return null;
	}

	return (
		<div className="flex items-center gap-4">
			<Link className="underline gap-1" href={`/customers/${customerId}/edit`}>
				編集
			</Link>
			<DeleteCustomerDialog customerId={customerId} />
		</div>
	);
}
