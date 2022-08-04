import { commands, ExtensionContext, workspace } from 'coc.nvim';
import { ActivityController } from './activity';
import { ClientController } from './client';
import { CONFIG_KEYS } from './constants';
import { ListenerController } from './listener';
import { logError, logInfo } from './logger';
import { getConfig } from './util';
import * as Commands from './commands';

const extensionName = process.env.EXTENSION_NAME ?? 'dev.coc-discord-rpc';
const extensionVersion = process.env.EXTENSION_VERSION ?? '0.0.0';

const config = getConfig();

export const activate = async (ctx: ExtensionContext) => {
	ctx.logger.info(`=== Extension activated ===`);
	ctx.logger.info(`Extension Name: ${extensionName}.`);
	ctx.logger.info(`Extension Version: ${extensionVersion}.`);

	ActivityController.setExtensionContext(ctx);

	let isWorkspaceIgnored = false;

	for (const pattern of config[CONFIG_KEYS.IgnoreWorkspaces]) {
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

	const enableCommand = commands.registerCommand(Commands.ENABLE_RPC, async () => {
		config.update('enabled', true);

		ListenerController.reset();
		await ClientController.login(ctx);

		if (config[CONFIG_KEYS.SuppressNotifications]) {
			await logInfo(`Enabled Discord Rich Presence for this workspace.`);
		}
	});

	const disableCommand = commands.registerCommand(Commands.DISABLE_RPC, async () => {
		config.update('enabled', false);

		ListenerController.reset();
		await ClientController.rpc.destroy();

		if (config[CONFIG_KEYS.SuppressNotifications]) {
			await logInfo(`Disabled Discord Rich Presence for this workspace.`);
		}
	});

	const disconnectCommand = commands.registerCommand(Commands.DISCONNECT_RPC, async () => {
		ListenerController.reset();
		await ClientController.rpc.destroy();
	});

	const reconnectCommand = commands.registerCommand(Commands.RECONNECT_RPC, async () => {
		ListenerController.reset();

		await ClientController.rpc.destroy();
		await ClientController.login(ctx);
	});

	const versionCommand = commands.registerCommand(Commands.VERSION_RPC, async () => {
		await logInfo(`v${extensionVersion}`);
	});

	ctx.subscriptions.push(enableCommand, disableCommand, reconnectCommand, disconnectCommand, versionCommand);

	if (!isWorkspaceIgnored && config[CONFIG_KEYS.Enabled]) {
		await ClientController.login(ctx);
	}
};

export const deactivate = async (ctx: ExtensionContext) => {
	ctx.logger.info(`=== Extension deactivated ===`);

	ListenerController.reset();
	await ClientController.rpc.destroy();
};

process.on('unhandledRejection', (error) => logError(`RPC: ${error}`));
