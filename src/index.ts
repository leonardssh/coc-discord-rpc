import Client from './client/Client';
import { log, LogLevel } from './structures/Logger';

import type { ExtensionContext } from 'coc.nvim';

const clientId = '768090036633206815';

const client: Client = new Client(clientId);

export const activate = async (ctx: ExtensionContext) => {
	log('Extension activated, trying to connect to Discord gateway', LogLevel.Info);
	await client.connect(ctx);
};

export const deactivate = async () => {
	log('Extension deactivated, trying to disconnect from Discord gateway', LogLevel.Info);
	return client.disconnect();
};

process.on('unhandledRejection', (err) => log(err as string, LogLevel.Err));
