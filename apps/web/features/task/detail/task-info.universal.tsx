type TaskInfoPresenterProps = {
	name: string;
};

export function TaskInfoPresenter({ name }: TaskInfoPresenterProps) {
	return <h1 className="text-2xl font-bold h-8">{name}</h1>;
}
