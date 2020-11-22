import Client from './client/Client';
import { log, LogLevel } from './structures/Logger';

import { ExtensionContext, workspace } from 'coc.nvim';

const config = workspace.getConfiguration('rpc');

const client: Client = new Client(config);

export const activate = async (ctx: ExtensionContext) => {
	if (!config.get<boolean>('hideStartupMessage')) {
		log('Extension activated, trying to connect to Discord gateway', LogLevel.Info);
	}

	await client.connect(ctx);
};

export const deactivate = async () => {
	log('Extension deactivated, trying to disconnect from Discord gateway', LogLevel.Info);
	return client.disconnect();
};

process.on('unhandledRejection', (err) => log(err as string, LogLevel.Err));
