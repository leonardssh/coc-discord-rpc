import { workspace, MsgTypes, ExtensionContext } from 'coc.nvim';

export class LoggingService {
	public logInfo(message: string, ctx?: ExtensionContext) {
		if (ctx) {
			const { logger } = ctx;

			logger.info(message);
		} else {
			this.logMessage(message, 'more');
		}
	}

	public logWarning(message: string, ctx?: ExtensionContext) {
		this.logMessage(message, 'warning');

		if (ctx) {
			const { logger } = ctx;

			logger.warn(message);
		} else {
			this.logMessage(message, 'more');
		}
	}

	public logError(ctx: ExtensionContext, message: string, error?: Error | string) {
		this.logMessage(message, 'error');

		const { logger } = ctx;

		if (typeof error === 'string') {
			logger.error(error);
		} else if (error?.message || error?.stack) {
			if (error?.message) {
				this.logMessage(error.message, 'error');
			}

			if (error?.stack) {
				logger.error(error);
			}
		}
	}

	private logMessage(message: string, logLevel: MsgTypes) {
		workspace.showMessage(`RPC: ${message}`, logLevel);
	}
}
