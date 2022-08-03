import { Client, FormatFunction } from '@xhayper/discord-rpc';
import { CONFIG_KEYS } from './constants';
import { ListenerController } from './listener';
import { ActivityController } from './activity';
import type { ExtensionContext } from 'coc.nvim';
import { logInfo } from './logger';
import { getConfig } from './util';
import fs from 'fs';
import path from 'path';

const config = getConfig();

const pathList: FormatFunction[] = [
	(id: number): [string, boolean] => {
		// Windows path

		const isWindows = process.platform === 'win32';

		return [isWindows ? `\\\\?\\pipe\\discord-ipc-${id}` : '', isWindows];
	},
	(id: number): [string] => {
		// macOS/Linux path

		if (process.platform === 'win32') return [''];

		const {
			env: { XDG_RUNTIME_DIR, TMPDIR, TMP, TEMP }
		} = process;

		let prefix = fs.realpathSync(XDG_RUNTIME_DIR || TMPDIR || TMP || TEMP || `${path.sep}tmp`);
		if (path.basename(prefix).startsWith('nvim')) prefix = path.dirname(prefix);

		return [path.join(prefix, `discord-ipc-${id}`)];
	},
	(id: number): [string] => {
		// Snap path

		if (process.platform === 'win32') return [''];

		const {
			env: { XDG_RUNTIME_DIR, TMPDIR, TMP, TEMP }
		} = process;

		let prefix = fs.realpathSync(XDG_RUNTIME_DIR || TMPDIR || TMP || TEMP || `${path.sep}tmp`);
		if (path.basename(prefix).startsWith('nvim')) prefix = path.dirname(prefix);

		return [path.join(prefix, 'snap.discord', `discord-ipc-${id}`)];
	},
	(id: number): [string] => {
		// Alternative snap path

		if (process.platform === 'win32') return [''];

		const {
			env: { XDG_RUNTIME_DIR, TMPDIR, TMP, TEMP }
		} = process;

		let prefix = fs.realpathSync(XDG_RUNTIME_DIR || TMPDIR || TMP || TEMP || `${path.sep}tmp`);
		if (path.basename(prefix).startsWith('nvim')) prefix = path.dirname(prefix);

		return [path.join(prefix, 'app', 'com.discordapp.Discord', `discord-ipc-${id}`)];
	}
];

export class ClientController {
	public static rpc: Client = new Client({ clientId: config[CONFIG_KEYS.ClientId], transport: { pathList } });

	public static async login(ctx: ExtensionContext) {
		ClientController.rpc = new Client({ clientId: config[CONFIG_KEYS.ClientId], transport: { pathList } });

		ClientController.rpc.once('ready', () => ClientController.handleLogin(ctx));
		ClientController.rpc.once('disconnected', () => ClientController.handleDisconnected(ctx));

		try {
			await ClientController.rpc.login();
		} catch (error) {
			ctx.logger.error(error);

			ListenerController.reset();
			await ClientController.rpc.destroy();
		}
	}

	private static async handleLogin(ctx: ExtensionContext) {
		ctx.logger.info('Connected to Discord Gateway');

		if (config[CONFIG_KEYS.SuppressNotifications]) {
			await logInfo('Connected to Discord Gateway!');
		}

		ListenerController.reset();
		await ActivityController.sendActivity();
		ListenerController.listen();
	}

	private static async handleDisconnected(ctx: ExtensionContext) {
		ctx.logger.info('Disconnected from Discord Gateway');

		if (config[CONFIG_KEYS.SuppressNotifications]) {
			await logInfo('Disconnected from Discord Gateway!');
		}

		ListenerController.reset();
		await ClientController.rpc.destroy();
	}
}
