import type React from "react";
import { Card } from "@workspace/ui/components/card";
import Link from "next/link";
import { ProjectForm } from "@/features/project/create/project-form.client";

export default function Page(): React.JSX.Element {
  return (
    <div className="container mx-auto max-w-2xl space-y-4 p-4">
      <div className="text-sm text-muted-foreground">
        <Link className="text-primary underline" href="/projects">
          プロジェクト
        </Link>{" "}
        / 新規作成
      </div>
      <h1 className="font-bold">新規プロジェクト</h1>
      <Card className="p-6">
        <ProjectForm />
      </Card>
    </div>
  );
}
