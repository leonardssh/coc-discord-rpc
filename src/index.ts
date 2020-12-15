import Client from './client/Client';
import { log, LogLevel } from './structures/Logger';

import { ExtensionContext, workspace, commands } from 'coc.nvim';

import { version } from './version/version';

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

	const enableCommand = commands.registerCommand('rpc.disable', () => {
		config.update('enabled', false);
		client.config = workspace.getConfiguration('rpc');

		client.dispose();

		log(`Disabled Discord Rich Presence for this workspace.`, LogLevel.Info);
	});

	const disableCommand = commands.registerCommand('rpc.enable', () => {
		void client.dispose();

		config.update('enabled', true);
		client.config = workspace.getConfiguration('rpc');

		void client.connect();

		log(`Enabled Discord Rich Presence for this workspace.`, LogLevel.Info);
	});

	const disconnectCommand = commands.registerCommand('rpc.disconnect', () => {
		log(`Trying to disconnect from Discord Gateway`, LogLevel.Info);
		client.disconnect();
	});

	const reconnectCommand = commands.registerCommand('rpc.reconnect', () => {
		log(`Trying to reconnect to Discord Gateway`, LogLevel.Info);
		void client.connect();
	});

	const versionCommand = commands.registerCommand('rpc.version', () => {
		log(`v${version}`, LogLevel.Info);
	});

	ctx.subscriptions.push(enableCommand, disableCommand, reconnectCommand, disconnectCommand, versionCommand);

	if (config.get<boolean>('enabled') && !isWorkspaceExcluded) {
		if (!config.get<boolean>('hideStartupMessage')) {
			log('Extension activated, trying to connect to Discord Gateway', LogLevel.Info);
		}

		try {
			await client.connect();
		} catch (error) {
			log(error, LogLevel.Err);
			client.dispose();
		}
	}
};

export const deactivate = () => {
	log('Extension deactivated, trying to disconnect from Discord Gateway', LogLevel.Info);
	client.disconnect();
};

process.on('unhandledRejection', (err) => log(err as string, LogLevel.Err));
