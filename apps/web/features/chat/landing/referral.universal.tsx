import { Skeleton } from "@workspace/ui/components/skeleton";
import type { OrganizationDetail } from "@/features/organization/detail/get-organization-detail";

export function ReferralPresenter({
	organization,
}: {
	organization: OrganizationDetail | null;
}) {
	if (organization) {
		return (
			<div className="flex flex-col gap-2">
				<span className="font-[family-name:var(--font-mincho)] text-[0.7rem] tracking-[0.3em] text-[#A07F40]">
					ご紹介元
				</span>
				<p className="font-[family-name:var(--font-mincho)] text-lg text-[#1F1B17]">
					{organization.name} <span className="text-sm text-[#4A4640]">様</span>
				</p>
				<p className="text-xs leading-relaxed text-[#4A4640]">
					上記の組織よりご案内を受けてお越しいただきました。
				</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-2 border-l-2 border-[#C97E70] pl-4">
			<span className="font-[family-name:var(--font-mincho)] text-[0.7rem] tracking-[0.3em] text-[#8C4A40]">
				お知らせ
			</span>
			<p className="text-sm leading-relaxed text-[#3A3530]">
				ご紹介元の指定がございません。このままご相談を始めることもできますが、
				<wbr />
				ご紹介情報は記録されません。
			</p>
		</div>
	);
}

export function ReferralSkeleton() {
	return (
		<div className="flex flex-col gap-2">
			<Skeleton className="h-3 w-16 bg-[#EDE6D9]" />
			<Skeleton className="h-6 w-48 bg-[#EDE6D9]" />
			<Skeleton className="h-3 w-full max-w-sm bg-[#EDE6D9]" />
		</div>
	);
}
