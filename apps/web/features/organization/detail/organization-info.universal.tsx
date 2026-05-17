import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { UpdateEmailDialog } from "../update-email/update-email-dialog.client";
import { ChatLpUrlField } from "./chat-lp-url-field.client";
import type { OrganizationDetail } from "./get-organization-detail";

export function OrganizationInfoPresenter({
	organization,
	chatLpUrl,
}: {
	organization: OrganizationDetail;
	chatLpUrl: string;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{organization.name}</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-3">
				<div className="text-sm">
					<span className="text-muted-foreground">カテゴリー: </span>
					{organization.categoryName}
				</div>
				<div className="flex items-center gap-2 text-sm flex-wrap">
					<span>
						<span className="text-muted-foreground">
							相談用メールアドレス:{" "}
						</span>
						{organization.email || "未設定"}
					</span>
					<UpdateEmailDialog
						currentEmail={organization.email}
						organizationId={organization.organizationId}
					/>
				</div>
				<div className="text-sm">
					<span className="text-muted-foreground">会社URL: </span>
					{organization.url ? (
						<a
							className="text-primary underline-offset-2 hover:underline break-all"
							href={organization.url}
							rel="noreferrer noopener"
							target="_blank"
						>
							{organization.url}
						</a>
					) : (
						"未設定"
					)}
				</div>
				<div className="text-sm">
					<div className="text-muted-foreground mb-1">会社概要:</div>
					{organization.description ? (
						<p className="whitespace-pre-wrap">{organization.description}</p>
					) : (
						<p className="text-muted-foreground">未設定</p>
					)}
				</div>
				<ChatLpUrlField url={chatLpUrl} />
			</CardContent>
		</Card>
	);
}
