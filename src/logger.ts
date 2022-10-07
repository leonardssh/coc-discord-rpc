import { window } from "coc.nvim";

export const logInfo = (message: string) => window.showInformationMessage(message);
export const logWarning = (message: string) => window.showWarningMessage(message);
export const logError = (message: string) => window.showErrorMessage(message);
