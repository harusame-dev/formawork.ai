"use client";

import type React from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function NavigationMenu(): React.JSX.Element {
  const [open, setOpen] = useState(false);

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger asChild>
        <Button size="icon" variant="ghost">
          <Menu className="size-6" />
          <span className="sr-only">メニューを開く</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>メニュー</SheetTitle>
        </SheetHeader>
        <nav className="mt-6">
          <ul className="space-y-2">
            <li>
              <Link
                className="block rounded-md px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
                href="/projects"
                onClick={() => setOpen(false)}
              >
                プロジェクト
              </Link>
            </li>
            <li>
              <Link
                className="block rounded-md px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
                href="/glossary"
                onClick={() => setOpen(false)}
              >
                共通用語集
              </Link>
            </li>
            <li>
              <Link
                className="block rounded-md px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
                href="/translation-memory"
                onClick={() => setOpen(false)}
              >
                翻訳メモリ
              </Link>
            </li>
            <li>
              <Link
                className="block rounded-md px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
                href="/staffs"
                onClick={() => setOpen(false)}
              >
                ユーザー
              </Link>
            </li>
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
