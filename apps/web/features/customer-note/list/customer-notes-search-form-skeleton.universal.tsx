import { Card, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { ChevronDown } from "lucide-react";

export function CustomerNotesSearchFormSkeleton(): JSX.Element {
  return (
    <div aria-busy="true">
      <div className="sr-only">読み込み中</div>
      <Card>
        <CardHeader className="py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="flex h-6 items-center">検索</CardTitle>
            </div>
            <ChevronDown className="size-5 text-muted-foreground" />
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
