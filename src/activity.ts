import { DiagnosticItem, diagnosticManager, Document, ExtensionContext, window, workspace } from "coc.nvim";
import { getConfig, getGitRepo, resolveFileIcon } from "./util";
import type { SetActivity } from "@xhayper/discord-rpc";
import { ClientController } from "./client";
import { basename } from "node:path";
import {
    CONFIG_KEYS,
    FAKE_EMPTY,
    IDLE_IMAGE_KEY,
    NEOVIM_IDLE_IMAGE_KEY,
    NEOVIM_IMAGE_KEY,
    REPLACE_KEYS,
    SEND_ACTIVITY_TIMEOUT,
    VIM_IDLE_IMAGE_KEY,
    VIM_IMAGE_KEY,
    ACCEPTED_DIAGNOSTIC_SEVERITY
} from "./constants";

let idleCheckTimeout: NodeJS.Timer | undefined;
let totalProblems = 0;

export async function generateDiagnostics() {
    const diagnostics = await diagnosticManager.getDiagnosticList();

    let counted = 0;

    diagnostics.forEach((diagnostic: DiagnosticItem) => {
        if (ACCEPTED_DIAGNOSTIC_SEVERITY.includes(diagnostic.severity)) counted++;
    });

    totalProblems = counted;
}

export class ActivityController {
    public static interval: NodeJS.Timer | undefined;

    public static extensionContext: ExtensionContext;

    private static presence: SetActivity = {};

    private static viewing = true;

    public static setExtensionContext(ctx: ExtensionContext) {
        ActivityController.extensionContext = ctx;
    }

    public static async sendActivity() {
        await generateDiagnostics();

        if (ActivityController.interval) clearTimeout(ActivityController.interval);

        ActivityController.interval = setTimeout(() => void ActivityController.sendActivity(), SEND_ACTIVITY_TIMEOUT);

        ActivityController.presence = {
            ...(await ActivityController.generateActivity(ActivityController.presence))
        };

        await ClientController.rpc.user?.setActivity(ActivityController.presence);
    }

    public static async generateActivity(previous: SetActivity = {}): Promise<SetActivity> {
        const config = getConfig();

        const appName = workspace.isNvim ? "NeoVim" : "Vim";
        const defaultLargeImageText = config[CONFIG_KEYS.LargeImageIdling];
        const defaultSmallImageKey = workspace.isNvim ? NEOVIM_IMAGE_KEY : VIM_IMAGE_KEY;
        const defaultSmallImageText = (config[CONFIG_KEYS.SmallImage] as string)
            .replaceAll(REPLACE_KEYS.AppName, appName)
            .replaceAll(REPLACE_KEYS.AppVersion, workspace.env.version);

        let state: SetActivity = {
            startTimestamp: config[CONFIG_KEYS.WorkspaceElapsedTime]
                ? undefined
                : previous.startTimestamp ?? new Date(),
            largeImageKey: workspace.isNvim ? NEOVIM_IDLE_IMAGE_KEY : VIM_IDLE_IMAGE_KEY,
            largeImageText: defaultLargeImageText,
            smallImageKey: previous.smallImageKey ?? defaultSmallImageKey,
            smallImageText: previous.smallImageText ?? defaultSmallImageText
        };

        const document = await workspace.document;

        if (document) {
            const largeImageKey = resolveFileIcon(document);
            const largeImageText = (config[CONFIG_KEYS.LargeImage] as string)
                .replaceAll(REPLACE_KEYS.LanguageLowerCase, largeImageKey.toLocaleLowerCase())
                .replaceAll(REPLACE_KEYS.LanguageUpperCase, largeImageKey.toLocaleUpperCase())
                .replaceAll(
                    REPLACE_KEYS.LanguageTitleCase,
                    largeImageKey.toLocaleLowerCase().replace(/^\w/, (c) => c.toLocaleUpperCase())
                );

            state = {
                ...state,
                details: await ActivityController.generateDetails(
                    CONFIG_KEYS.DetailsEditing,
                    CONFIG_KEYS.DetailsIdling,
                    CONFIG_KEYS.DetailsViewing
                ),
                state: await ActivityController.generateDetails(
                    CONFIG_KEYS.LowerDetailsEditing,
                    CONFIG_KEYS.LowerDetailsIdling,
                    CONFIG_KEYS.LowerDetailsViewing
                ),
                largeImageKey,
                largeImageText
            };

            if (config[CONFIG_KEYS.ButtonEnabled]) {
                const gitRepo = await getGitRepo();

                if (gitRepo && config[CONFIG_KEYS.ButtonActiveLabel]) {
                    state = {
                        ...state,
                        buttons: [{ label: config[CONFIG_KEYS.ButtonActiveLabel], url: gitRepo }]
                    };
                } else if (
                    !gitRepo &&
                    config[CONFIG_KEYS.ButtonInactiveLabel] &&
                    config[CONFIG_KEYS.ButtonInactiveUrl]
                ) {
                    state = {
                        ...state,
                        buttons: [
                            {
                                label: config[CONFIG_KEYS.ButtonInactiveLabel],
                                url: config[CONFIG_KEYS.ButtonInactiveUrl]
                            }
                        ]
                    };
                }
            }
        }

        return state;
    }

    public static async toggleViewingMode(viewingState = true) {
        ActivityController.viewing = viewingState;
        await ActivityController.sendActivity();
    }

    public static async checkIdle(focused: boolean) {
        const config = getConfig();

        if (!config[CONFIG_KEYS.CheckIdle]) return;

        if (idleCheckTimeout) clearTimeout(idleCheckTimeout);
        idleCheckTimeout = undefined;

        if (focused) {
            await ActivityController.setIdle(false);
        } else {
            idleCheckTimeout = setInterval(async () => {
                await ActivityController.setIdle(true);

                if (idleCheckTimeout) clearTimeout(idleCheckTimeout);
                idleCheckTimeout = undefined;
            }, config[CONFIG_KEYS.IdleTimeout] * 1000);
        }
    }

    private static async generateDetails(
        editing: CONFIG_KEYS,
        idling: CONFIG_KEYS,
        viewing: CONFIG_KEYS
    ): Promise<string> {
        const config = getConfig();
        const document = await workspace.document;

        let raw = (config[idling] as string).replaceAll(REPLACE_KEYS.Empty, FAKE_EMPTY);

        if (document) {
            raw = (ActivityController.viewing ? config[viewing] : config[editing]) as string;

            const fileName = basename(document.uri);
            const fileIcon = resolveFileIcon(document);

            const noWorkspaceFound = config[CONFIG_KEYS.LowerDetailsNotFound].replaceAll(
                REPLACE_KEYS.Empty,
                FAKE_EMPTY
            );
            const workspaceFolderName =
                workspace.getWorkspaceFolder(document.uri)?.name ??
                (config[CONFIG_KEYS.UseCWDAsFallback] ? basename(workspace.cwd) : null) ??
                noWorkspaceFound;

            const problems = config[CONFIG_KEYS.ShowProblems]
                ? config[CONFIG_KEYS.ProblemsText].replaceAll(REPLACE_KEYS.ProblemsCount, totalProblems.toString())
                : "";

            try {
                raw = await ActivityController.generateFileDetails(raw, document);
            } catch (error) {
                ActivityController.extensionContext.logger.error(`Failed to generate file details: ${error}`);
            }

            raw = raw
                .replaceAll(REPLACE_KEYS.FileName, fileName)
                .replaceAll(REPLACE_KEYS.Problems, problems)
                .replaceAll(REPLACE_KEYS.WorkspaceFolder, workspaceFolderName)
                .replaceAll(REPLACE_KEYS.LanguageLowerCase, fileIcon.toLocaleLowerCase())
                .replaceAll(REPLACE_KEYS.LanguageUpperCase, fileIcon.toLocaleUpperCase())
                .replaceAll(
                    REPLACE_KEYS.LanguageTitleCase,
                    fileIcon.toLocaleLowerCase().replace(/^\w/, (c) => c.toLocaleUpperCase())
                );
        }

        return raw;
    }

    private static async generateFileDetails(_raw: string, document: Document): Promise<string> {
        let raw = _raw.slice();

        if (!raw) return raw;

        if (raw.includes(REPLACE_KEYS.TotalLines))
            raw = raw.replaceAll(REPLACE_KEYS.TotalLines, document.lineCount.toLocaleString());

        if (raw.includes(REPLACE_KEYS.CurrentLine))
            raw = raw.replaceAll(
                REPLACE_KEYS.CurrentLine,
                ((await window.getCursorPosition()).line + 1).toLocaleString()
            );

        if (raw.includes(REPLACE_KEYS.CurrentColumn))
            raw = raw.replaceAll(
                REPLACE_KEYS.CurrentColumn,
                ((await window.getCursorPosition()).character + 1).toLocaleString()
            );

        return raw;
    }

    private static async setIdle(status: boolean) {
        if (status) {
            const config = getConfig();

            ActivityController.presence = {
                ...ActivityController.presence,
                smallImageKey: IDLE_IMAGE_KEY,
                smallImageText: config[CONFIG_KEYS.IdleText]
            };
        } else {
            delete ActivityController.presence.smallImageKey;
            delete ActivityController.presence.smallImageText;
        }

        await ActivityController.sendActivity();
    }
}
