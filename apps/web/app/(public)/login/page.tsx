import type React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "@/features/auth/login/login-form.client";
import Logo from "@/public/icon-512x512.png";

export const metadata: Metadata = {
  title: "ログイン",
};

export default function LoginPage(): React.JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center bg-background p-4">
      <div className="mx-auto mt-16 w-16">
        <Image alt="" sizes="64px" src={Logo} />
      </div>
      <p className="font-mono text-sm">TransDesk</p>
      <Card className="mt-8 w-full max-w-sm">
        <CardHeader>
          <CardTitle className="mx-auto text-2xl">ログイン</CardTitle>
          <CardDescription className="mx-auto text-center text-sm">
            デモ環境です。ログインボタンを押して自由にお試しいただけます
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
