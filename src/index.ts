import type { ExtensionContext } from 'coc.nvim';
import { LoggingService } from './services/logging';

const extensionName = process.env.EXTENSION_NAME || 'dev.coc-discord-rpc';
const extensionVersion = process.env.EXTENSION_VERSION || '0.0.0';

const loggingService = new LoggingService();

export const activate = (ctx: ExtensionContext) => {
	loggingService.logInfo(`=== Extension activated ===`, ctx);
	loggingService.logInfo(`Extension Name: ${extensionName}.`, ctx);
	loggingService.logInfo(`Extension Version: ${extensionVersion}.`, ctx);
};

export const deactivate = () => {
	loggingService.logInfo(`=== Extension deactivated ===`);
};
