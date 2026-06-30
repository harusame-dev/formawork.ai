"use client";

import type React from "react";
import {
  PROJECT_MEMBER_ROLE_LABEL,
  ProjectMemberRole,
} from "@workspace/db/schema/project";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { UserPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addMemberAction } from "./add-member.action";
import type { CandidateUser } from "./get-candidate-users";
import type { ProjectMemberItem } from "./get-project-members";
import { removeMemberAction } from "./remove-member.action";

interface MembersCardProps {
  candidates: CandidateUser[];
  canManage: boolean;
  members: ProjectMemberItem[];
  ownerUserId: string;
  projectId: string;
}

export function MembersCard({
  candidates,
  canManage,
  members,
  ownerUserId,
  projectId,
}: MembersCardProps): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>(
    String(ProjectMemberRole.Editor),
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const memberIds = new Set(members.map((member) => member.userId));
  const addableCandidates = candidates.filter(
    (candidate) => !memberIds.has(candidate.userId),
  );

  function handleAdd(): void {
    if (!selectedUserId) {
      return;
    }
    setErrorMessage(null);
    startTransition(async () => {
      const result = await addMemberAction({
        projectId,
        role: Number(selectedRole) as
          | typeof ProjectMemberRole.Editor
          | typeof ProjectMemberRole.Viewer,
        userId: selectedUserId,
      });
      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }
      setOpen(false);
      setSelectedUserId("");
      router.refresh();
    });
  }

  function handleRemove(userId: string): void {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await removeMemberAction({ projectId, userId });
      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-bold">メンバー</h1>
          <p className="text-sm text-muted-foreground">
            このプロジェクトに参加しているメンバーの一覧です。
          </p>
        </div>
        {canManage && (
          <Dialog onOpenChange={setOpen} open={open}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <UserPlus className="size-4" />
                メンバーを追加
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>メンバーを追加</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">ユーザー</span>
                  <Select
                    onValueChange={setSelectedUserId}
                    value={selectedUserId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="ユーザーを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {addableCandidates.map((candidate) => (
                        <SelectItem
                          key={candidate.userId}
                          value={candidate.userId}
                        >
                          {candidate.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">ロール</span>
                  <Select onValueChange={setSelectedRole} value={selectedRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={String(ProjectMemberRole.Editor)}>
                        {PROJECT_MEMBER_ROLE_LABEL[ProjectMemberRole.Editor]}
                      </SelectItem>
                      <SelectItem value={String(ProjectMemberRole.Viewer)}>
                        {PROJECT_MEMBER_ROLE_LABEL[ProjectMemberRole.Viewer]}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {errorMessage && (
                  <div className="text-sm text-destructive" role="alert">
                    {errorMessage}
                  </div>
                )}
                <Button
                  disabled={!selectedUserId || isPending}
                  onClick={handleAdd}
                >
                  追加する
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card className="p-4">
        <ul className="divide-y">
          {members.map((member) => (
            <li
              className="flex items-center justify-between gap-2 py-2"
              key={member.userId}
            >
              <span className="text-sm">{member.name}</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {PROJECT_MEMBER_ROLE_LABEL[member.role]}
                </Badge>
                {canManage && member.userId !== ownerUserId && (
                  <Button
                    aria-label={`${member.name} を削除`}
                    disabled={isPending}
                    onClick={() => handleRemove(member.userId)}
                    size="icon"
                    variant="ghost"
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
        {!canManage && (
          <p className="mt-2 text-xs text-muted-foreground">
            メンバーの管理はオーナーのみ行えます
          </p>
        )}
      </Card>
    </div>
  );
}
