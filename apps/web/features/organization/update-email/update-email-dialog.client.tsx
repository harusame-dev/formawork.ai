"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { Button } from "@workspace/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
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
import { Pencil } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as v from "valibot";
import { useIsHydrated } from "@/libs/use-is-hydrated.hook";
import { organizationEmailSchema } from "../schema";
import { updateOrganizationEmailAction } from "./update-organization-email.action";

const formSchema = v.object({
	email: organizationEmailSchema,
});

type FormValues = v.InferOutput<typeof formSchema>;

export function UpdateEmailDialog({
	currentEmail,
	organizationId,
}: {
	currentEmail: string;
	organizationId: string;
}) {
	const [open, setOpen] = useState(false);
	const { isHydrated } = useIsHydrated();

	const form = useForm<FormValues>({
		defaultValues: { email: currentEmail },
		resolver: valibotResolver(formSchema),
	});

	async function onSubmit(values: FormValues) {
		form.clearErrors("root");
		const result = await updateOrganizationEmailAction({
			email: values.email,
			organizationId,
		});
		if (!result.success) {
			form.setError("root", {
				message: result.error || "エラーが発生しました",
			});
			return;
		}
		setOpen(false);
	}

	function handleOpenChange(next: boolean) {
		setOpen(next);
		if (next) {
			form.reset({ email: currentEmail });
		}
	}

	const disabled = form.formState.isSubmitting || !isHydrated;

	return (
		<Dialog onOpenChange={handleOpenChange} open={open}>
			<DialogTrigger asChild>
				<Button
					aria-label="相談用メールアドレスを更新"
					size="sm"
					type="button"
					variant="outline"
				>
					<Pencil className="size-4" />
					更新する
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>相談用メールアドレスを更新</DialogTitle>
					<DialogDescription>
						相談メールの送信先を変更します。未入力の場合は相談ボタンからのメール送信は行いません。
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form
						className="flex flex-col gap-4"
						noValidate
						onSubmit={form.handleSubmit(onSubmit)}
					>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>相談用メールアドレス</FormLabel>
									<FormDescription>
										254 文字以内で正しいメールアドレス形式で入力してください
									</FormDescription>
									<FormControl>
										<Input
											autoComplete="email"
											disabled={disabled}
											type="email"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						{form.formState.errors.root && (
							<p className="text-sm text-destructive" role="alert">
								{form.formState.errors.root.message}
							</p>
						)}
						<DialogFooter>
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
								isProcessing={form.formState.isSubmitting}
								processingLabel="更新中"
								type="submit"
							>
								更新する
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
