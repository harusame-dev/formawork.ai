type UserInfoPresenterProps = {
	firstName: string;
	lastName: string;
};

export function UserInfoPresenter({
	firstName,
	lastName,
}: UserInfoPresenterProps) {
	return (
		<h1 className="text-2xl font-bold h-8">
			{lastName} {firstName}
		</h1>
	);
}
