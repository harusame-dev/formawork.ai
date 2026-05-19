import type React from "react";
import { Card } from "@workspace/ui/components/card";
import { ChangePasswordForm } from "@/features/auth/change-password/change-password-form.client";

export default function PasswordChangePage(): React.JSX.Element {
  return (
    <div className="container mx-auto space-y-4 p-2">
      <h1 className="font-bold">パスワード変更</h1>
      <Card className="w-full p-4">
        <ChangePasswordForm />
      </Card>
    </div>
  );
}
