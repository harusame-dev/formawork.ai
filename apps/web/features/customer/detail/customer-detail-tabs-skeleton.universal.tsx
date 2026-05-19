import type React from "react";
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";

export function CustomerDetailTabsSkeleton(): React.JSX.Element {
  const tabs = [
    { label: "基本情報", value: "basic" },
    { label: "ノート", value: "notes" },
    { label: "メモリ", value: "memories" },
  ] as const;

  return (
    <Tabs className="w-full" value="basic">
      <TabsList className="grid w-full grid-cols-3 bg-muted-foreground/10">
        {tabs.map((tab) => (
          <TabsTrigger
            className="pointer-events-none opacity-50"
            disabled
            key={tab.value}
            value={tab.value}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
