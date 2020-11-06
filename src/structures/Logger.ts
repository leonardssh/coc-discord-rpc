import { workspace } from 'coc.nvim';

export enum LogLevel {
	Info = 'more',
	Warn = 'warning',
	Err = 'error'
}

export const log = (logMsg: string, logLevel: LogLevel) => workspace.showMessage(`RPC: ${logMsg}`, logLevel);
