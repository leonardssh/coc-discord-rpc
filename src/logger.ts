import { ExtensionContext, MsgTypes, workspace } from 'coc.nvim';

export const logMessage = (message: string, logLevel: MsgTypes) => {
	workspace.showMessage(`RPC: ${message}`, logLevel);
};

export const logInfo = (message: string) => {
	logMessage(message, 'more');
};

export const logWarning = (message: string) => {
	logMessage(message, 'warning');
};

export const logError = (message: string, ctx: ExtensionContext, error?: Error | string) => {
	logMessage(message, 'error');

	const { logger } = ctx;

	if (typeof error === 'string') {
		logger.error(error);
	} else if (error?.message || error?.stack) {
		if (error?.message) {
			logMessage(error.message, 'error');
		}

		if (error?.stack) {
			logger.error(error);
		}
	}
};
