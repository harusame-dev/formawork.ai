import type React from "react";
import { Card } from "@workspace/ui/components/card";
import { EditStaffForm } from "@/features/staff/register/edit-staff-form.client";

export default function NewStaffPage(): React.JSX.Element {
  return (
    <div className="container mx-auto space-y-4 p-2">
      <h1 className="font-bold">新規スタッフ登録</h1>
      <Card className="w-full p-4">
        <EditStaffForm />
      </Card>
    </div>
  );
}
