"use client";

import type React from "react";
import { valibotResolver } from "@hookform/resolvers/valibot";
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
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as v from "valibot";
import { useIsHydrated } from "@/libs/use-is-hydrated.hook";
import {
  CUSTOMER_SEARCH_KEYWORD_MAX_LENGTH,
  customersConditionSchema,
} from "./schema";

const formSchema = v.omit(customersConditionSchema, ["page"]);

export function CustomerSearchForm({
  condition,
}: {
  condition: v.InferInput<typeof formSchema>;
}): React.JSX.Element {
  const router = useRouter();
  const { isHydrated } = useIsHydrated();

  const form = useForm<v.InferInput<typeof formSchema>>({
    defaultValues: { keyword: condition.keyword },
    resolver: valibotResolver(formSchema),
  });

  function onSubmit({ keyword }: v.InferOutput<typeof formSchema>): void {
    const parameters = new URLSearchParams();
    if (keyword) {
      parameters.set("keyword", keyword);
    }

    router.push(`/customers?${parameters}`);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="keyword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>キーワード</FormLabel>
              <FormDescription>
                姓名、セイメイ、電話番号、メールアドレスを前方一致で検索（最大
                {CUSTOMER_SEARCH_KEYWORD_MAX_LENGTH}文字）
              </FormDescription>
              <div className="flex items-center gap-4">
                <FormControl>
                  <Input
                    {...field}
                    disabled={!isHydrated}
                    maxLength={CUSTOMER_SEARCH_KEYWORD_MAX_LENGTH}
                    type="text"
                  />
                </FormControl>
                <Button disabled={!isHydrated} type="submit">
                  <Search className="mr-2 size-4" />
                  検索
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
