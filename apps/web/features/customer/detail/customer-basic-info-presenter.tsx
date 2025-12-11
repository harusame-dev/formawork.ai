import type { ReactNode } from "react";
import { DateTime } from "@/components/date-time";
import { GENDER_LABELS, type Gender } from "../schema";

type Customer = {
	address: string;
	birthDate: string | null;
	createdAt: Date;
	customerId: string;
	email: string;
	firstName: string;
	firstNameKana: string;
	gender: Gender;
	lastName: string;
	lastNameKana: string;
	phone: string;
	remarks: string;
	updatedAt: Date;
};

type CustomerBasicInfoPresenterProps = {
	customer: Customer;
};

type CustomerField = {
	label: string;
	value: ReactNode;
};

export function CustomerBasicInfoPresenter({
	customer,
}: CustomerBasicInfoPresenterProps) {
	const kanaName =
		customer.lastNameKana || customer.firstNameKana
			? `${customer.lastNameKana} ${customer.firstNameKana}`.trim()
			: null;

	const fields: CustomerField[] = [
		...(kanaName
			? [
					{
						label: "ふりがな",
						value: kanaName,
					},
				]
			: []),
		{
			label: "メールアドレス",
			value: customer.email ? (
				<a className="text-primary underline" href={`mailto:${customer.email}`}>
					{customer.email}
				</a>
			) : (
				"未登録"
			),
		},
		{
			label: "電話番号",
			value: customer.phone ? (
				<a className="text-primary underline" href={`tel:${customer.phone}`}>
					{customer.phone}
				</a>
			) : (
				"未登録"
			),
		},
		{
			label: "住所",
			value: customer.address || "未登録",
		},
		{
			label: "生年月日",
			value: customer.birthDate || "未登録",
		},
		{
			label: "性別",
			value: GENDER_LABELS[customer.gender] || "未登録",
		},
		{
			label: "備考",
			value: customer.remarks || "未登録",
		},
		{
			label: "登録日",
			value: <DateTime date={customer.createdAt} />,
		},
		{
			label: "更新日",
			value: <DateTime date={customer.updatedAt} />,
		},
	];

	return (
		<div className="space-y-4">
			{fields.map((field) => (
				<div className="grid gap-2" key={field.label}>
					<div className="text-sm text-muted-foreground">{field.label}</div>
					<div className="font-bold">{field.value}</div>
				</div>
			))}
		</div>
	);
}
