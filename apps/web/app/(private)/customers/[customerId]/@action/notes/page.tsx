import { Button } from "@workspace/ui/components/button";
import { Suspense } from "react";
import { RegisterCustomerNoteDialogContainer } from "@/features/customer-note/register/register-customer-note-dialog.server";

export default async function CustomerNoteActionPage({
  params,
}: PageProps<"/customers/[customerId]/notes">): Promise<JSX.Element> {
  const customerIdPromise = params.then(({ customerId }) => customerId);

  return (
    <Suspense
      fallback={
        <Button disabled size="sm">
          ノートを追加
        </Button>
      }
    >
      <RegisterCustomerNoteDialogContainer customerId={customerIdPromise} />
    </Suspense>
  );
}
