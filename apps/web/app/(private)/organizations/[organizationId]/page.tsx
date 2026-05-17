import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@workspace/ui/components/tabs";
import { Pencil } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { UserRole } from "@/features/auth/get-user-role";
import { requireRole } from "@/features/auth/require-role";
import { ChatHistoryByOrgContainer } from "@/features/chat-history/chat-history-by-org.server";
import { ChatHistorySkeleton } from "@/features/chat-history/chat-history-skeleton.universal";
import { DeleteOrganizationDialog } from "@/features/organization/delete/delete-organization-dialog.client";
import { getOrganizationDetail } from "@/features/organization/detail/get-organization-detail";
import { OrganizationInfoContainer } from "@/features/organization/detail/organization-info.server";
import { OrganizationInfoSkeleton } from "@/features/organization/detail/organization-info-skeleton.universal";

export default function Page({
	params,
}: PageProps<"/organizations/[organizationId]">) {
	const organizationIdPromise = params.then((p) => p.organizationId);

	return (
		<div className="container mx-auto p-4 flex flex-col gap-4 max-w-4xl">
			<Suspense
				fallback={
					<div className="flex items-center justify-between">
						<Skeleton className="h-6 w-64" />
					</div>
				}
			>
				<OrganizationHeader organizationIdPromise={organizationIdPromise} />
			</Suspense>

			<Tabs defaultValue="info">
				<TabsList>
					<TabsTrigger value="info">組織情報</TabsTrigger>
					<TabsTrigger value="chats">関連チャット履歴</TabsTrigger>
				</TabsList>
				<TabsContent className="pt-4" value="info">
					<Suspense fallback={<OrganizationInfoSkeleton />}>
						<OrganizationInfoWrapper
							organizationIdPromise={organizationIdPromise}
						/>
					</Suspense>
				</TabsContent>
				<TabsContent className="pt-4" value="chats">
					<Suspense fallback={<ChatHistorySkeleton />}>
						<ChatHistoryWrapper organizationIdPromise={organizationIdPromise} />
					</Suspense>
				</TabsContent>
			</Tabs>
		</div>
	);
}

async function OrganizationHeader({
	organizationIdPromise,
}: {
	organizationIdPromise: Promise<string>;
}) {
	const role = await requireRole([UserRole.Admin, UserRole.OrgUser]);
	const organizationId = await organizationIdPromise;
	const organization = await getOrganizationDetail(organizationId);
	if (!organization) {
		notFound();
	}

	return (
		<div className="flex items-center justify-between flex-wrap gap-2">
			<h1 className="text-xl font-semibold">{organization.name}</h1>
			{role === UserRole.Admin && (
				<div className="flex gap-2">
					<Button asChild size="sm" variant="outline">
						<Link href={`/organizations/${organizationId}/edit` as Route}>
							<Pencil className="size-4" />
							編集
						</Link>
					</Button>
					<DeleteOrganizationDialog
						organizationId={organizationId}
						organizationName={organization.name}
					/>
				</div>
			)}
		</div>
	);
}

async function OrganizationInfoWrapper({
	organizationIdPromise,
}: {
	organizationIdPromise: Promise<string>;
}) {
	const organizationId = await organizationIdPromise;
	return <OrganizationInfoContainer organizationId={organizationId} />;
}

async function ChatHistoryWrapper({
	organizationIdPromise,
}: {
	organizationIdPromise: Promise<string>;
}) {
	const organizationId = await organizationIdPromise;
	return <ChatHistoryByOrgContainer organizationId={organizationId} />;
}
