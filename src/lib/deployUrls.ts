// 配信先のURL（.github/workflows/deploy-gh-pages.yml と CLAUDE.md の「デプロイ運用」を参照）
export type DeployTarget = {
	key: 'prod' | 'dev',
	label: string,
	description: string,
	url: string,
};

export const DEPLOY_TARGETS: DeployTarget[] = [
	{
		key: 'prod',
		label: '本番',
		description: 'vX.Y.Z タグで更新',
		url: 'https://wkym461a.github.io/cycle-combo/',
	},
	{
		key: 'dev',
		label: '開発',
		description: 'main への push で更新',
		url: 'https://wkym461a.github.io/cycle-combo/dev/',
	},
];

/** 今開いているページがどの配信先か（ローカル開発中などは undefined） */
export function getCurrentDeployTarget(): DeployTarget | undefined {
	const here = window.location.origin + import.meta.env.BASE_URL;
	return DEPLOY_TARGETS.find(target => target.url === here);
}
