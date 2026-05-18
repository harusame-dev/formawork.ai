interface StaffInfoPresenterProps {
  firstName: string;
  lastName: string;
}

export function StaffInfoPresenter({
  firstName,
  lastName,
}: StaffInfoPresenterProps): JSX.Element {
  return (
    <h1 className="h-8 text-2xl font-bold">
      {lastName} {firstName}
    </h1>
  );
}
