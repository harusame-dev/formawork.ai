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
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useIsHydrated } from "@/libs/use-is-hydrated.hook";
import { registerGlossaryAction } from "./register-glossary.action";
import { type RegisterGlossaryParams, registerGlossarySchema } from "./schema";

export function RegisterGlossaryDialog({
  projectId,
}: {
  projectId?: string;
}): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { isHydrated } = useIsHydrated();

  const form = useForm<RegisterGlossaryParams>({
    defaultValues: {
      note: "",
      projectId: projectId ?? null,
      sourceTerm: "",
      targetTerm: "",
    },
    resolver: valibotResolver(registerGlossarySchema),
  });

  const disabled = !isHydrated || isPending;

  function onSubmit(values: RegisterGlossaryParams): void {
    startTransition(async () => {
      const result = await registerGlossaryAction(values);
      if (result.success) {
        form.reset();
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
          form.reset();
        }
        setOpen(nextOpen);
      }}
      open={open}
    >
      <DialogTrigger asChild>
        <Button disabled={!isHydrated}>
          <Plus className="size-4" />
          用語を追加
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>用語を追加</DialogTitle>
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
                processingLabel="追加中"
                type="submit"
              >
                追加する
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
