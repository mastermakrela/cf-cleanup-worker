import Cloudflare from 'cloudflare';

// For some reason the type definitions for cloudflare are not up to date
// so there are some red squiggly lines, but it works

export default {
	async scheduled(event, env, ctx): Promise<void> {
		const account_id = env.ACCOUNT_ID;
		const apiToken = env.API_TOKEN;

		if (!account_id || !apiToken) {
			console.error('Missing ACCOUNT_ID or API_TOKEN environment variable');
			return;
		}

		const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

		const cf = new Cloudflare.Cloudflare({
			apiToken: apiToken,
		});

		for await (const page of cf.pages.projects.list({ account_id })) {
			const deployments = [];

			if (!page.name) continue;
			const current_id: string = page.canonical_deployment.id;

			for await (const deployment of cf.pages.projects.deployments.list(page.name, { account_id })) {
				if (deployment.id === current_id) continue;

				const created_on = new Date(deployment.created_on!);

				if (deployment.is_skipped || created_on.getTime() <= threeDaysAgo.getTime()) {
					deployments.push(deployment);
				}
			}

			for (const deployment of deployments) {
				try {
					await cf.pages.projects.deployments.delete(page.name, deployment.id, { account_id });
				} catch (error) {}
			}
		}
	},
} satisfies ExportedHandler<Env>;
