/* eslint-disable @typescript-eslint/ban-ts-comment */

import type { ExtensionContext } from 'coc.nvim';
// @ts-ignore
import { name as EXTENSION_NAME, version as EXTENSION_VERSION } from '../package.json';
import { LoggingService } from './services/logging';

const extensionName = EXTENSION_NAME || 'dev.coc-discord-rpc';
const extensionVersion = EXTENSION_VERSION || '0.0.0';

const loggingService = new LoggingService();

export const activate = (ctx: ExtensionContext) => {
	loggingService.logInfo(`=== Extension activate ===`, ctx);
	loggingService.logInfo(`Extension Name: ${extensionName}.`, ctx);
	loggingService.logInfo(`Extension Version: ${extensionVersion}.`, ctx);
};

export const deactivate = () => {
	loggingService.logInfo(`=== Extension deactivate ===`);
};
