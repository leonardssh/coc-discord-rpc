import { commands, ExtensionContext, workspace } from 'coc.nvim';
import { Client } from './client';
import { logError, logInfo, logMessage } from './logger';

const extensionName = process.env.EXTENSION_NAME || 'dev.coc-discord-rpc';
const extensionVersion = process.env.EXTENSION_VERSION || '0.0.0';

const config = workspace.getConfiguration('rpc');

const client: Client = new Client(config);

let loginTimeout: NodeJS.Timer | undefined = undefined;

export const activate = async (ctx: ExtensionContext) => {
	const { logger } = ctx;

	logger.info(`=== Extension activated ===`);
	logger.info(`Extension Name: ${extensionName}.`);
	logger.info(`Extension Version: ${extensionVersion}.`);

	const enableCommand = commands.registerCommand('rpc.disable', async () => {
		config.update('enabled', false);
		client.config = workspace.getConfiguration('rpc');

		await client.dispose();

		logInfo(`Disabled Discord Rich Presence for this workspace.`);
	});

	const disableCommand = commands.registerCommand('rpc.enable', async () => {
		await client.dispose();

		config.update('enabled', true);
		client.config = workspace.getConfiguration('rpc');

		await client.connect(ctx);

		logInfo(`Enabled Discord Rich Presence for this workspace.`);
	});

	const disconnectCommand = commands.registerCommand('rpc.disconnect', async () => {
		logInfo(`Trying to disconnect from Discord Gateway`);
		await client.dispose();
	});

	const reconnectCommand = commands.registerCommand('rpc.reconnect', async () => {
		if (loginTimeout) {
			clearTimeout(loginTimeout);
		}

		await client.dispose();

		loginTimeout = setTimeout(async () => {
			try {
				await client.connect(ctx);
			} catch (error) {
				logError('Encountered following error after trying to login', ctx, error);

				await client.dispose();
			}
		}, 1000);

		logInfo(`Trying to reconnect to Discord Gateway`);
		await client.connect(ctx);
	});

	const versionCommand = commands.registerCommand('rpc.version', () => {
		logInfo(`v${extensionVersion}`);
	});

	ctx.subscriptions.push(enableCommand, disableCommand, reconnectCommand, disconnectCommand, versionCommand);

	let isWorkspaceIgnored = false;

	const { ignoreWorkspaces, enabled } = client.config;

	if (ignoreWorkspaces?.length) {
		for (const pattern of ignoreWorkspaces) {
			const regex = new RegExp(pattern);
			const folders = workspace.workspaceFolders;

			if (!folders) {
				break;
			}

			if (folders.some((folder) => regex.test(folder.name))) {
				isWorkspaceIgnored = true;
				break;
			}
		}
	}

	if (!isWorkspaceIgnored && enabled) {
		try {
			await client.connect(ctx);
		} catch (error) {
			logError('Encountered following error after trying to login', ctx, error);

			await client.dispose();
		}
	}
};

export const deactivate = async () => {
	logInfo(`=== Extension deactivated ===`);

	await client.dispose();
};

process.on('unhandledRejection', (err) => logMessage(err as string, 'error'));
