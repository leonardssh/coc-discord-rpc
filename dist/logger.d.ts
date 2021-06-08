import { ExtensionContext, MsgTypes } from 'coc.nvim';
export declare const logMessage: (message: string, logLevel: MsgTypes) => void;
export declare const logInfo: (message: string) => void;
export declare const logWarning: (message: string) => void;
export declare const logError: (message: string, ctx: ExtensionContext, error?: string | Error | undefined) => void;
//# sourceMappingURL=logger.d.ts.map