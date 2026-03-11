import type { ReactNode } from "react";
import { DateTime } from "@/components/date-time.client";

type User = {
	createdAt: Date;
	email: string;
	firstName: string;
	lastName: string;
	role: string;
	userId: string;
	updatedAt: Date;
};

const RoleLabel = {
	admin: "管理者",
	user: "一般",
} as const;

type UserBasicInfoPresenterProps = {
	user: User;
};

type UserField = {
	label: string;
	value: ReactNode;
};

export function UserBasicInfoPresenter({ user }: UserBasicInfoPresenterProps) {
	const roleLabel =
		user.role in RoleLabel
			? RoleLabel[user.role as keyof typeof RoleLabel]
			: user.role;

	const fields: UserField[] = [
		{
			label: "メールアドレス",
			value: user.email || "-",
		},
		{
			label: "ロール",
			value: roleLabel,
		},
		{
			label: "登録日",
			value: <DateTime date={user.createdAt} />,
		},
		{
			label: "更新日",
			value: <DateTime date={user.updatedAt} />,
		},
	];

	return (
		<table className="w-full">
			<tbody className="space-y-4 [&>tr]:block">
				{fields.map((field) => (
					<tr key={field.label}>
						<th
							className="block text-left text-sm font-normal text-muted-foreground"
							scope="row"
						>
							{field.label}
						</th>
						<td className="block font-bold">{field.value}</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}
