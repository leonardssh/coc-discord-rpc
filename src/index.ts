import Client from './client/Client';
import { log, LogLevel } from './structures/Logger';

import { ExtensionContext, workspace } from 'coc.nvim';

const config = workspace.getConfiguration('rpc');

const client: Client = new Client(config);

export const activate = async (ctx: ExtensionContext) => {
	const workspaceName = workspace.root.split('/').pop();
	const excludePatterns = config.get<string[]>('ignoreWorkspaces');

	let isWorkspaceExcluded = false;

	if (excludePatterns?.length) {
		for (const pattern of excludePatterns) {
			const regex = new RegExp(pattern);
			const folders = workspace.workspaceFolders;

			if (!folders && !workspaceName) {
				break;
			}

			if (folders.some((folder) => regex.test(folder.name)) || regex.test(workspaceName!)) {
				isWorkspaceExcluded = true;
				break;
			}
		}
	}

	if (config.get<boolean>('enabled') && !isWorkspaceExcluded) {
		if (!config.get<boolean>('hideStartupMessage')) {
			log('Extension activated, trying to connect to Discord Gateway', LogLevel.Info);
		}

		await client.connect(ctx);
	}
};

export const deactivate = async () => {
	log('Extension deactivated, trying to disconnect from Discord Gateway', LogLevel.Info);
	return client.disconnect();
};

process.on('unhandledRejection', (err) => log(err as string, LogLevel.Err));
