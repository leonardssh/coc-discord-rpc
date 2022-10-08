"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityController = exports.generateDiagnostics = void 0;
const coc_nvim_1 = require("coc.nvim");
const util_1 = require("./util");
const client_1 = require("./client");
const node_path_1 = require("node:path");
const constants_1 = require("./constants");
let idleCheckTimeout = undefined;
let totalProblems = 0;
async function generateDiagnostics() {
    const diagnostics = await coc_nvim_1.diagnosticManager.getDiagnosticList();
    let counted = 0;
    diagnostics.forEach((diagnostic) => {
        if (diagnostic.severity === "Warning" || diagnostic.severity === "Error") {
            counted++;
        }
    });
    totalProblems = counted;
}
exports.generateDiagnostics = generateDiagnostics;
class ActivityController {
    static interval;
    static extensionContext;
    static presence = {};
    static viewing = true;
    static setExtensionContext(ctx) {
        ActivityController.extensionContext = ctx;
    }
    static async sendActivity() {
        await generateDiagnostics();
        if (ActivityController.interval) {
            clearTimeout(ActivityController.interval);
        }
        ActivityController.interval = setTimeout(() => void ActivityController.sendActivity(), constants_1.SEND_ACTIVITY_TIMEOUT);
        ActivityController.presence = {
            ...(await ActivityController.generateActivity(ActivityController.presence))
        };
        await client_1.ClientController.rpc.user?.setActivity(ActivityController.presence);
    }
    static async generateActivity(previous = {}) {
        const config = (0, util_1.getConfig)();
        const appName = coc_nvim_1.workspace.isNvim ? "NeoVim" : "Vim";
        const defaultLargeImageText = config["largeImageIdling" /* CONFIG_KEYS.LargeImageIdling */];
        const defaultSmallImageKey = constants_1.NEOVIM_IMAGE_KEY;
        const defaultSmallImageText = config["smallImage" /* CONFIG_KEYS.SmallImage */]
            .replace("{app_name}" /* REPLACE_KEYS.AppName */, appName)
            .replace("{app_version}" /* REPLACE_KEYS.AppVersion */, coc_nvim_1.workspace.env.version);
        let state = {
            startTimestamp: config["workspaceElapsedTime" /* CONFIG_KEYS.WorkspaceElapsedTime */]
                ? undefined
                : previous.startTimestamp ?? Number(new Date()),
            largeImageKey: constants_1.NEOVIM_IDLE_IMAGE_KEY,
            largeImageText: defaultLargeImageText,
            smallImageKey: previous.smallImageKey ?? defaultSmallImageKey,
            smallImageText: previous.smallImageText ?? defaultSmallImageText
        };
        const document = await coc_nvim_1.workspace.document;
        if (document) {
            const largeImageKey = (0, util_1.resolveFileIcon)(document);
            const largeImageText = config["largeImage" /* CONFIG_KEYS.LargeImage */]
                .replace("{lang}" /* REPLACE_KEYS.LanguageLowerCase */, largeImageKey.toLocaleLowerCase())
                .replace("{LANG}" /* REPLACE_KEYS.LanguageUpperCase */, largeImageKey.toLocaleUpperCase())
                .replace("{Lang}" /* REPLACE_KEYS.LanguageTitleCase */, largeImageKey.toLocaleLowerCase().replace(/^\w/, (c) => c.toLocaleUpperCase()));
            state = {
                ...state,
                details: await ActivityController.generateDetails("detailsEditing" /* CONFIG_KEYS.DetailsEditing */, "detailsIdling" /* CONFIG_KEYS.DetailsIdling */, "detailsViewing" /* CONFIG_KEYS.DetailsViewing */),
                state: await ActivityController.generateDetails("lowerDetailsEditing" /* CONFIG_KEYS.LowerDetailsEditing */, "lowerDetailsIdling" /* CONFIG_KEYS.LowerDetailsIdling */, "lowerDetailsViewing" /* CONFIG_KEYS.LowerDetailsViewing */),
                largeImageKey,
                largeImageText
            };
            if (config["buttonEnabled" /* CONFIG_KEYS.ButtonEnabled */]) {
                const gitRepo = await (0, util_1.getGitRepo)();
                if (gitRepo && config["buttonActiveLabel" /* CONFIG_KEYS.ButtonActiveLabel */]) {
                    state = {
                        ...state,
                        buttons: [{ label: config["buttonActiveLabel" /* CONFIG_KEYS.ButtonActiveLabel */], url: gitRepo }]
                    };
                }
                else if (!gitRepo &&
                    config["buttonInactiveLabel" /* CONFIG_KEYS.ButtonInactiveLabel */] &&
                    config["buttonInactiveUrl" /* CONFIG_KEYS.ButtonInactiveUrl */]) {
                    state = {
                        ...state,
                        buttons: [
                            {
                                label: config["buttonInactiveLabel" /* CONFIG_KEYS.ButtonInactiveLabel */],
                                url: config["buttonInactiveUrl" /* CONFIG_KEYS.ButtonInactiveUrl */]
                            }
                        ]
                    };
                }
            }
        }
        return state;
    }
    static async toggleViewingMode(viewingState = true) {
        ActivityController.viewing = viewingState;
        await ActivityController.sendActivity();
    }
    static async checkIdle(focused) {
        const config = (0, util_1.getConfig)();
        if (config["checkIdle" /* CONFIG_KEYS.CheckIdle */]) {
            if (focused) {
                if (idleCheckTimeout) {
                    clearTimeout(idleCheckTimeout);
                }
                idleCheckTimeout = undefined;
                await ActivityController.setIdle(false);
            }
            else {
                if (idleCheckTimeout) {
                    clearTimeout(idleCheckTimeout);
                }
                idleCheckTimeout = setInterval(async () => {
                    await ActivityController.setIdle(true);
                    if (idleCheckTimeout) {
                        clearTimeout(idleCheckTimeout);
                    }
                    idleCheckTimeout = undefined;
                }, config["idleTimeout" /* CONFIG_KEYS.IdleTimeout */] * 1000);
            }
        }
    }
    static async generateDetails(editing, idling, viewing) {
        const config = (0, util_1.getConfig)();
        const document = await coc_nvim_1.workspace.document;
        let raw = config[idling].replace("{empty}" /* REPLACE_KEYS.Empty */, constants_1.FAKE_EMPTY);
        if (document) {
            if (ActivityController.viewing) {
                raw = config[viewing];
            }
            else {
                raw = config[editing];
            }
            const fileName = (0, node_path_1.basename)(document.uri);
            const fileIcon = (0, util_1.resolveFileIcon)(document);
            const noWorkspaceFound = config["lowerDetailsNotFound" /* CONFIG_KEYS.LowerDetailsNotFound */].replace("{empty}" /* REPLACE_KEYS.Empty */, constants_1.FAKE_EMPTY);
            const workspaceFolderName = coc_nvim_1.workspace.getWorkspaceFolder(document.uri)?.name ??
                (config["useCWDAsFallback" /* CONFIG_KEYS.UseCWDAsFallback */] ? (0, node_path_1.basename)(coc_nvim_1.workspace.cwd) : null) ??
                noWorkspaceFound;
            const problems = config["showProblems" /* CONFIG_KEYS.ShowProblems */]
                ? config["problemsText" /* CONFIG_KEYS.ProblemsText */].replace("{count}" /* REPLACE_KEYS.ProblemsCount */, totalProblems.toString())
                : "";
            try {
                raw = await ActivityController.generateFileDetails(raw, document);
            }
            catch (error) {
                ActivityController.extensionContext.logger.error(`Failed to generate file details: ${error}`);
            }
            raw = raw
                .replace("{file_name}" /* REPLACE_KEYS.FileName */, fileName)
                .replace("{problems}" /* REPLACE_KEYS.Problems */, problems)
                .replace("{workspace_folder}" /* REPLACE_KEYS.WorkspaceFolder */, workspaceFolderName)
                .replace("{lang}" /* REPLACE_KEYS.LanguageLowerCase */, fileIcon.toLocaleLowerCase())
                .replace("{LANG}" /* REPLACE_KEYS.LanguageUpperCase */, fileIcon.toLocaleUpperCase())
                .replace("{Lang}" /* REPLACE_KEYS.LanguageTitleCase */, fileIcon.toLocaleLowerCase().replace(/^\w/, (c) => c.toLocaleUpperCase()));
        }
        return raw;
    }
    static async generateFileDetails(_raw, document) {
        let raw = _raw.slice();
        if (!raw) {
            return raw;
        }
        if (raw.includes("{total_lines}" /* REPLACE_KEYS.TotalLines */)) {
            raw = raw.replace("{total_lines}" /* REPLACE_KEYS.TotalLines */, document.lineCount.toLocaleString());
        }
        if (raw.includes("{current_line}" /* REPLACE_KEYS.CurrentLine */)) {
            raw = raw.replace("{current_line}" /* REPLACE_KEYS.CurrentLine */, ((await coc_nvim_1.window.getCursorPosition()).line + 1).toLocaleString());
        }
        if (raw.includes("{current_column}" /* REPLACE_KEYS.CurrentColumn */)) {
            raw = raw.replace("{current_column}" /* REPLACE_KEYS.CurrentColumn */, ((await coc_nvim_1.window.getCursorPosition()).character + 1).toLocaleString());
        }
        return raw;
    }
    static async setIdle(status) {
        if (status) {
            const config = (0, util_1.getConfig)();
            ActivityController.presence = {
                ...ActivityController.presence,
                smallImageKey: constants_1.IDLE_IMAGE_KEY,
                smallImageText: config["idleText" /* CONFIG_KEYS.IdleText */]
            };
        }
        else {
            delete ActivityController.presence.smallImageKey;
            delete ActivityController.presence.smallImageText;
        }
        await ActivityController.sendActivity();
    }
}
exports.ActivityController = ActivityController;
