import type React from "react";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Check, X } from "lucide-react";
import { LpSection } from "./lp-section";

const permissions = [
  { admin: true, feature: "スタッフの登録・削除", user: false },
  { admin: true, feature: "顧客の登録・編集・削除", user: false },
  { admin: true, feature: "接客ノートの閲覧", user: true },
  { admin: true, feature: "自分のノートの編集・削除", user: true },
] as const;

export function PermissionSection(): React.JSX.Element {
  return (
    <LpSection
      description="チームでの運用に対応した2段階のアクセス制御"
      title="安心の権限管理"
    >
      <p className="mx-auto mb-8 max-w-3xl text-center text-muted-foreground">
        管理者（Admin）とユーザー（User）の2つのロールで、
        適切なアクセス権限を設定。大切な顧客情報を守りながら、
        チームでの円滑な運用を実現します。
      </p>
      <Card className="mx-auto max-w-2xl">
        <CardContent className="pt-6">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left font-medium" scope="col">
                  機能
                </th>
                <th className="px-4 py-3 text-center font-medium" scope="col">
                  Admin
                </th>
                <th className="px-4 py-3 text-center font-medium" scope="col">
                  User
                </th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((permission) => (
                <tr
                  className="border-b last:border-b-0"
                  key={permission.feature}
                >
                  <td className="px-4 py-3 text-sm">{permission.feature}</td>
                  <td className="px-4 py-3 text-center">
                    {permission.admin ? (
                      <Check className="mx-auto size-5 text-primary" />
                    ) : (
                      <X className="mx-auto size-5 text-muted-foreground" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {permission.user ? (
                      <Check className="mx-auto size-5 text-primary" />
                    ) : (
                      <X className="mx-auto size-5 text-muted-foreground" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            「所有権ベースのアクセス制御」により、
            自分が作成したノートのみ編集・削除が可能です。
          </p>
        </CardContent>
      </Card>
    </LpSection>
  );
}
