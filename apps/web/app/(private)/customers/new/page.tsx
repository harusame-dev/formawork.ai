import { Card } from "@workspace/ui/components/card";
import { EditCustomerForm } from "@/features/customer/register/edit-customer-form.client";

export default function NewCustomerPage(): JSX.Element {
  return (
    <div className="container mx-auto space-y-4 p-2">
      <h1 className="font-bold">新規顧客登録</h1>
      <Card className="w-full p-4">
        <EditCustomerForm />
      </Card>
    </div>
  );
}
