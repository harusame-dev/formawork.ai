import { Skeleton } from "@workspace/ui/components/skeleton";

const SKELETON_FIELDS = [
  { labelWidth: "w-14", valueWidth: "w-32" }, // ふりがな
  { labelWidth: "w-[84px]", valueWidth: "w-48" }, // メールアドレス
  { labelWidth: "w-10", valueWidth: "w-28" }, // 電話番号
  { labelWidth: "w-8", valueWidth: "w-56" }, // 住所
  { labelWidth: "w-14", valueWidth: "w-24" }, // 生年月日
  { labelWidth: "w-8", valueWidth: "w-12" }, // 性別
  { labelWidth: "w-8", valueWidth: "w-48" }, // 備考
  { labelWidth: "w-10", valueWidth: "w-32" }, // 登録日
  { labelWidth: "w-10", valueWidth: "w-32" }, // 更新日
] as const;

export function CustomerBasicInfoSkeleton(): JSX.Element {
  return (
    <div className="space-y-4">
      {SKELETON_FIELDS.map((field, index) => (
        <div className="grid gap-2" key={index}>
          <Skeleton className={`h-5 ${field.labelWidth}`} />
          <Skeleton className={`h-6 ${field.valueWidth}`} />
        </div>
      ))}
    </div>
  );
}
