import type { ReactNode } from "react";
import { DateTime } from "@/components/date-time";

type Staff = {
	createdAt: Date;
	email: string;
	firstName: string;
	lastName: string;
	role: string;
	staffId: string;
	updatedAt: Date;
};

const RoleLabel = {
	admin: "管理者",
	user: "一般",
} as const;

type StaffBasicInfoPresenterProps = {
	staff: Staff;
};

type StaffField = {
	label: string;
	value: ReactNode;
};

export function StaffBasicInfoPresenter({
	staff,
}: StaffBasicInfoPresenterProps) {
	const roleLabel =
		staff.role in RoleLabel
			? RoleLabel[staff.role as keyof typeof RoleLabel]
			: staff.role;

	const fields: StaffField[] = [
		{
			label: "メールアドレス",
			value: staff.email || "-",
		},
		{
			label: "ロール",
			value: roleLabel,
		},
		{
			label: "登録日",
			value: <DateTime date={staff.createdAt} />,
		},
		{
			label: "更新日",
			value: <DateTime date={staff.updatedAt} />,
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
