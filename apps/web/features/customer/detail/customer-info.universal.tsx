import type React from "react";
interface CustomerInfoPresenterProps {
  firstName: string;
  lastName: string;
}

export function CustomerInfoPresenter({
  firstName,
  lastName,
}: CustomerInfoPresenterProps): React.JSX.Element {
  return (
    <h1 className="min-h-8 text-2xl font-bold">
      {lastName} {firstName}
    </h1>
  );
}
