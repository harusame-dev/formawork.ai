import type React from "react";
import { OptionalBadge } from "@workspace/ui/components/optional-badge";
import { RequiredBadge } from "@workspace/ui/components/required-badge";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { cn } from "@workspace/ui/lib/utils";

function FormItemSkeleton({
  label,
  required,
  description,
  inputClassName,
}: {
  label: string;
  required?: boolean;
  description?: string;
  inputClassName?: string;
}): React.JSX.Element {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm leading-none font-bold">
        {label}
        {required ? <RequiredBadge /> : <OptionalBadge />}
      </div>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      <Skeleton className={cn("h-9 rounded-md", inputClassName)} />
    </div>
  );
}

export function CustomerEditFormSkeleton(): React.JSX.Element {
  return (
    <div aria-busy="true">
      <div className="sr-only">読み込み中</div>
      <div className="flex flex-col gap-6">
        <FormItemSkeleton
          description="24文字以内で入力してください"
          inputClassName="max-w-xs"
          label="姓"
          required
        />
        <FormItemSkeleton
          description="24文字以内で入力してください"
          inputClassName="max-w-xs"
          label="名"
          required
        />
        <FormItemSkeleton
          description="ひらがなで入力してください"
          inputClassName="max-w-xs"
          label="姓（かな）"
        />
        <FormItemSkeleton
          description="ひらがなで入力してください"
          inputClassName="max-w-xs"
          label="名（かな）"
        />
        <FormItemSkeleton
          description="254文字以内で入力してください"
          inputClassName="max-w-sm"
          label="メールアドレス"
        />
        <FormItemSkeleton
          description="数字のみ20文字以内で入力してください（ハイフンは自動で除去されます）"
          inputClassName="w-40"
          label="電話番号"
        />
        <FormItemSkeleton
          description="200文字以内で入力してください"
          inputClassName="max-w-md"
          label="住所"
        />
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm leading-none font-bold">
            生年月日
            <OptionalBadge />
          </div>
          <Skeleton className="h-9 w-40 rounded-md" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm leading-none font-bold">
            性別
            <RequiredBadge />
          </div>
          <div className="flex flex-wrap gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="flex items-center gap-2" key={index}>
                <Skeleton className="size-4 rounded-full" />
                <Skeleton className="h-4 w-12 rounded-md" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm leading-none font-bold">
            備考
            <OptionalBadge />
          </div>
          <p className="text-sm text-muted-foreground">
            4096文字以内で入力してください
          </p>
          <Skeleton className="min-h-[100px] w-full rounded-md" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 min-w-[120px] rounded-md" />
        </div>
      </div>
    </div>
  );
}
