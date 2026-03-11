type ProjectInfoPresenterProps = {
	name: string;
};

export function ProjectInfoPresenter({ name }: ProjectInfoPresenterProps) {
	return <h1 className="text-2xl font-bold h-8">{name}</h1>;
}
