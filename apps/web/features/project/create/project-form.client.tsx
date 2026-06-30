"use client";

import type React from "react";
import { valibotResolver } from "@hookform/resolvers/valibot";
import {
  PROJECT_VISIBILITY_LABEL,
  ProjectVisibility,
} from "@workspace/db/schema/project";
import { Button } from "@workspace/ui/components/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/components/radio-group";
import { RequiredBadge } from "@workspace/ui/components/required-badge";
import { Textarea } from "@workspace/ui/components/textarea";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { editProjectAction } from "@/features/project/edit/edit-project.action";
import { useIsHydrated } from "@/libs/use-is-hydrated.hook";
import { registerProjectAction } from "./register-project.action";
import { type RegisterProjectParams, registerProjectSchema } from "./schema";

type ProjectFormProps =
  | {
      disabled?: boolean;
      initialValues?: undefined;
      projectId?: undefined;
    }
  | {
      disabled?: boolean;
      initialValues: RegisterProjectParams;
      projectId: string;
    };

export function ProjectForm({
  disabled: disabledProperty,
  initialValues,
  projectId,
}: ProjectFormProps): React.JSX.Element {
  const router = useRouter();
  const { isHydrated } = useIsHydrated();
  const isEditMode = !!projectId;

  const form = useForm<RegisterProjectParams>({
    defaultValues: initialValues ?? {
      description: "",
      name: "",
      visibility: ProjectVisibility.Private,
    },
    resolver: valibotResolver(registerProjectSchema),
  });

  async function onSubmit(values: RegisterProjectParams): Promise<void> {
    form.clearErrors("root");

    const result = isEditMode
      ? await editProjectAction({ projectId, ...values })
      : await registerProjectAction(values);

    if (!result.success) {
      form.setError("root", {
        message: result.error || "エラーが発生しました",
      });
    }
  }

  const disabled = !!(
    form.formState.isSubmitting ||
    !isHydrated ||
    disabledProperty
  );

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-6"
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                プロジェクト名
                <RequiredBadge />
              </FormLabel>
              <FormDescription>100文字以内で入力してください</FormDescription>
              <FormControl>
                <Input
                  className="max-w-md"
                  disabled={disabled}
                  type="text"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>説明</FormLabel>
              <FormDescription>
                プロジェクトの説明を500文字以内で入力してください（任意）
              </FormDescription>
              <FormControl>
                <Textarea
                  className="max-w-md"
                  disabled={disabled}
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="visibility"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                可視性
                <RequiredBadge />
              </FormLabel>
              <FormDescription>
                Public はログインユーザー全員が閲覧可能、Private
                は招待したメンバーのみ閲覧可能です
              </FormDescription>
              <FormControl>
                <RadioGroup
                  disabled={disabled}
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={String(field.value)}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem
                      id="visibility-private"
                      value={String(ProjectVisibility.Private)}
                    />
                    <Label htmlFor="visibility-private">
                      {PROJECT_VISIBILITY_LABEL[ProjectVisibility.Private]}
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem
                      id="visibility-public"
                      value={String(ProjectVisibility.Public)}
                    />
                    <Label htmlFor="visibility-public">
                      {PROJECT_VISIBILITY_LABEL[ProjectVisibility.Public]}
                    </Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root && (
          <div className="text-sm text-destructive" role="alert">
            {form.formState.errors.root.message}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            disabled={disabled}
            onClick={() => router.back()}
            type="button"
            variant="outline"
          >
            キャンセル
          </Button>
          <Button
            className="min-w-[120px]"
            disabled={disabled}
            isProcessing={form.formState.isSubmitting}
            processingLabel={isEditMode ? "保存中" : "作成中"}
            type="submit"
          >
            {isEditMode ? "保存する" : "作成する"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
