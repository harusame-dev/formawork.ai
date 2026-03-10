type CustomerInfoPresenterProps = {
	firstName: string;
	lastName: string;
};

export function CustomerInfoPresenter({
	firstName,
	lastName,
}: CustomerInfoPresenterProps) {
	return (
		<h1 className="text-2xl font-bold min-h-8">
			{lastName} {firstName}
		</h1>
	);
}
