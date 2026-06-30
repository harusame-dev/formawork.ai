"use client";

import type React from "react";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
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
import { RequiredBadge } from "@workspace/ui/components/required-badge";
import { Textarea } from "@workspace/ui/components/textarea";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useIsHydrated } from "@/libs/use-is-hydrated.hook";
import { editGlossaryAction } from "./edit-glossary.action";
import { type EditGlossaryFormValues, editGlossaryFormSchema } from "./schema";

export function EditGlossaryDialog({
  glossaryId,
  note,
  sourceTerm,
  targetTerm,
}: {
  glossaryId: string;
  note: string;
  sourceTerm: string;
  targetTerm: string;
}): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { isHydrated } = useIsHydrated();

  const defaultValues: EditGlossaryFormValues = {
    note,
    sourceTerm,
    targetTerm,
  };

  const form = useForm<EditGlossaryFormValues>({
    defaultValues,
    resolver: valibotResolver(editGlossaryFormSchema),
  });

  const disabled = !isHydrated || isPending;

  function onSubmit(values: EditGlossaryFormValues): void {
    startTransition(async () => {
      const result = await editGlossaryAction({ glossaryId, ...values });
      if (result.success) {
        setOpen(false);
        router.refresh();
      } else {
        form.setError("root", {
          message: result.error || "エラーが発生しました",
        });
      }
    });
  }

  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          form.reset(defaultValues);
        }
        setOpen(nextOpen);
      }}
      open={open}
    >
      <DialogTrigger asChild>
        <Button disabled={!isHydrated} size="sm" variant="outline">
          <Pencil className="size-4" />
          編集
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>用語を編集</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            noValidate
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="sourceTerm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    原語
                    <RequiredBadge />
                  </FormLabel>
                  <FormDescription>
                    翻訳元の用語を100文字以内で入力してください
                  </FormDescription>
                  <FormControl>
                    <Input disabled={disabled} type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetTerm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    訳語
                    <RequiredBadge />
                  </FormLabel>
                  <FormDescription>
                    翻訳先の用語を200文字以内で入力してください
                  </FormDescription>
                  <FormControl>
                    <Input disabled={disabled} type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>メモ</FormLabel>
                  <FormDescription>
                    用語の補足説明を300文字以内で入力してください（任意）
                  </FormDescription>
                  <FormControl>
                    <Textarea disabled={disabled} rows={3} {...field} />
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

            <div className="flex justify-end gap-2">
              <Button
                disabled={disabled}
                onClick={() => setOpen(false)}
                type="button"
                variant="outline"
              >
                キャンセル
              </Button>
              <Button
                disabled={disabled}
                isProcessing={isPending}
                processingLabel="更新中"
                type="submit"
              >
                更新する
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
