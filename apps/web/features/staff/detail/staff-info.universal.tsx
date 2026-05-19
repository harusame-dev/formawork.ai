import type React from "react";
interface StaffInfoPresenterProps {
  firstName: string;
  lastName: string;
}

export function StaffInfoPresenter({
  firstName,
  lastName,
}: StaffInfoPresenterProps): React.JSX.Element {
  return (
    <h1 className="h-8 text-2xl font-bold">
      {lastName} {firstName}
    </h1>
  );
}
