const DELETED_ORG_LABEL = "（削除された組織）" as const;

export function formatOrgDisplayName(name: string | null | undefined): string {
	return name ?? DELETED_ORG_LABEL;
}
