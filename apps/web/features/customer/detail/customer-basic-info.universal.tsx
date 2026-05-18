import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import { DateTime } from "@/components/date-time.client";
import { GENDER_LABELS, type Gender } from "@/features/customer/schema";

interface Customer {
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
}

interface CustomerBasicInfoPresenterProps {
  customer: Customer;
}

interface CustomerField {
  label: string;
  value: ReactNode;
}

export function CustomerBasicInfoPresenter({
  customer,
}: CustomerBasicInfoPresenterProps): JSX.Element {
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
      value: customer.address ? (
        <a
          className="inline-flex items-center gap-1 text-primary underline"
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(customer.address)}`}
          rel="noopener noreferrer"
          target="_blank"
        >
          {customer.address}
          <ExternalLink className="size-4" />
        </a>
      ) : (
        "未登録"
      ),
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
