// /* eslint-disable prefer-destructuring */
import { diagnosticManager, Document, ExtensionContext, window, workspace } from 'coc.nvim';
import type { Presence } from 'discord-rpc';
import { basename } from 'path';
import { ClientController } from './client';
import {
	CONFIG_KEYS,
	FAKE_EMPTY,
	IDLE_IMAGE_KEY,
	NEOVIM_IDLE_IMAGE_KEY,
	NEOVIM_IMAGE_KEY,
	REPLACE_KEYS,
	SEND_ACTIVITY_TIMEOUT
} from './constants';
import { getConfig, getGitRepo, resolveFileIcon } from './util';

let idleCheckTimeout: NodeJS.Timeout | undefined = undefined;

export class ActivityController {
	public static interval: NodeJS.Timeout | undefined;

	public static extensionContext: ExtensionContext;

	private static presence: Presence = {};

	private static viewing = true;

	public static setExtensionContext(ctx: ExtensionContext) {
		ActivityController.extensionContext = ctx;
	}

	public static async sendActivity() {
		if (ActivityController.interval) {
			clearTimeout(ActivityController.interval);
		}

		ActivityController.interval = setTimeout(() => void ActivityController.sendActivity(), SEND_ACTIVITY_TIMEOUT);

		ActivityController.presence = {
			...(await ActivityController.generateActivity(ActivityController.presence))
		};

		await ClientController.rpc.setActivity(ActivityController.presence);
	}

	public static async generateActivity(previous: Presence = {}) {
		const config = getConfig();

		const appName = workspace.isNvim ? 'NeoVim' : 'Vim';
		const defaultLargeImageText = config[CONFIG_KEYS.LargeImageIdling];
		const defaultSmallImageKey = NEOVIM_IMAGE_KEY;
		const defaultSmallImageText = (config[CONFIG_KEYS.SmallImage] as string)
			.replace(REPLACE_KEYS.AppName, appName)
			.replace(REPLACE_KEYS.AppVersion, workspace.env.version);

		let state: Presence = {
			startTimestamp: config[CONFIG_KEYS.WorkspaceElapsedTime]
				? undefined
				: previous.startTimestamp ?? Number(new Date()),
			largeImageKey: NEOVIM_IDLE_IMAGE_KEY,
			largeImageText: defaultLargeImageText,
			smallImageKey: previous.smallImageKey ?? defaultSmallImageKey,
			smallImageText: previous.smallImageText ?? defaultSmallImageText
		};

		const document = await workspace.document;

		if (document) {
			const largeImageKey = resolveFileIcon(document);
			const largeImageText = (config[CONFIG_KEYS.LargeImage] as string)
				.replace(REPLACE_KEYS.LanguageLowerCase, largeImageKey.toLocaleLowerCase())
				.replace(REPLACE_KEYS.LanguageUpperCase, largeImageKey.toLocaleUpperCase())
				.replace(
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

		if (config[CONFIG_KEYS.CheckIdle]) {
			if (focused) {
				if (idleCheckTimeout) {
					clearTimeout(idleCheckTimeout);
				}

				idleCheckTimeout = undefined;

				await ActivityController.setIdle(false);
			} else {
				if (idleCheckTimeout) {
					clearTimeout(idleCheckTimeout);
				}

				idleCheckTimeout = setInterval(async () => {
					await ActivityController.setIdle(true);

					if (idleCheckTimeout) {
						clearTimeout(idleCheckTimeout);
					}

					idleCheckTimeout = undefined;
				}, config[CONFIG_KEYS.IdleTimeout] * 1000);
			}
		}
	}

	private static async generateDetails(editing: CONFIG_KEYS, idling: CONFIG_KEYS, viewing: CONFIG_KEYS) {
		const config = getConfig();
		const document = await workspace.document;

		let raw = (config[idling] as string).replace(REPLACE_KEYS.Empty, FAKE_EMPTY);

		if (document) {
			if (ActivityController.viewing) {
				raw = config[viewing] as string;
			} else {
				raw = config[editing] as string;
			}

			const fileName = basename(document.uri);
			const fileIcon = resolveFileIcon(document);

			const noWorkspaceFound = config[CONFIG_KEYS.LowerDetailsNotFound].replace(REPLACE_KEYS.Empty, FAKE_EMPTY);
			const workspaceFolder = workspace.getWorkspaceFolder(document.uri);
			const workspaceFolderName = workspaceFolder?.name ?? noWorkspaceFound;

			const problemsCount = diagnosticManager.getDiagnostics(document.uri).length;

			const problems = config[CONFIG_KEYS.ShowProblems]
				? config[CONFIG_KEYS.ProblemsText].replace(REPLACE_KEYS.ProblemsCount, problemsCount.toString())
				: '';

			try {
				raw = await ActivityController.generateFileDetails(raw, document);
			} catch (error) {
				ActivityController.extensionContext.logger.error(`Failed to generate file details: ${error}`);
			}

			raw = raw
				.replace(REPLACE_KEYS.FileName, fileName)
				.replace(REPLACE_KEYS.Problems, problems)
				.replace(REPLACE_KEYS.WorkspaceFolder, workspaceFolderName)
				.replace(REPLACE_KEYS.LanguageLowerCase, fileIcon.toLocaleLowerCase())
				.replace(REPLACE_KEYS.LanguageUpperCase, fileIcon.toLocaleUpperCase())
				.replace(
					REPLACE_KEYS.LanguageTitleCase,
					fileIcon.toLocaleLowerCase().replace(/^\w/, (c) => c.toLocaleUpperCase())
				);
		}

		return raw;
	}

	private static async generateFileDetails(_raw: string, document: Document) {
		let raw = _raw.slice();

		if (!raw) {
			return raw;
		}

		if (raw.includes(REPLACE_KEYS.TotalLines)) {
			raw = raw.replace(REPLACE_KEYS.TotalLines, document.lineCount.toLocaleString());
		}

		if (raw.includes(REPLACE_KEYS.CurrentLine)) {
			raw = raw.replace(REPLACE_KEYS.CurrentLine, ((await window.getCursorPosition()).line + 1).toLocaleString());
		}

		if (raw.includes(REPLACE_KEYS.CurrentColumn)) {
			raw = raw.replace(
				REPLACE_KEYS.CurrentColumn,
				((await window.getCursorPosition()).character + 1).toLocaleString()
			);
		}

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
