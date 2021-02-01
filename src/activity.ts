/* eslint-disable prefer-destructuring */
import { diagnosticManager, Disposable, Document, extensions, workspace } from 'coc.nvim';
import type { Presence } from 'discord-rpc';
import { basename } from 'path';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import type { Client } from './client';
import icon from './icons.json';

interface FileDetail {
	size?: string;
	totalLines?: string;
	currentLine?: string;
	currentColumn?: string;
}

const enum defaultIcons {
	standard_neovim = 'neovim-logo',
	standard_neovim_idle = 'idle-neovim',
	standard_idle = 'idle'
}

const empty = '\u200b\u200b';

const knownExtensions: { [key: string]: { image: string } } = icon.knownExtensions;
const knownLanguages: string[] = icon.knownLanguages;

const isNeoVim = workspace.isNvim ? 'NeoVim' : 'Vim';

let idleCheckTimeout: NodeJS.Timer | undefined = undefined;

const resolveIcon = (document: Document) => {
	const filename = basename(document.uri);
	const { languageId } = document.textDocument;

	const icon =
		knownExtensions[
			Object.keys(knownExtensions).find((key) => {
				if (filename.endsWith(key)) {
					return true;
				}

				const match = /^\/(.*)\/([mgiy]+)$/.exec(key);
				if (!match) {
					return false;
				}

				const regex = new RegExp(match[1], match[2]);
				return regex.test(filename);
			})!
		] ?? (knownLanguages.includes(languageId) ? languageId : null);

	return icon ? icon.image ?? icon : 'text';
};

export class Activity implements Disposable {
	private presence: Presence = {};

	private viewing = false;

	public constructor(public client: Client) {}

	public async init() {
		const { workspaceElapsedTime, largeImageIdle, detailsIdle, lowerDetailsIdle, smallImage } = this.client.config;

		if (workspaceElapsedTime) {
			this.presence.startTimestamp = Date.now();
		}

		this.presence.details = detailsIdle.replace('{null}', empty);
		this.presence.state = lowerDetailsIdle.replace('{null}', empty);
		this.presence.largeImageKey = defaultIcons.standard_neovim_idle;
		this.presence.largeImageText = largeImageIdle;
		this.presence.smallImageKey = defaultIcons.standard_neovim;
		this.presence.smallImageText = smallImage
			.replace('{appname}', isNeoVim)
			.replace('{appversion}', workspace.env.version);

		await this.checkIdle(true);
		await this.update();
	}

	public async onFileSwitch(bufnr: number | string) {
		let icon = defaultIcons.standard_neovim_idle as string;

		const document = workspace.getDocument(bufnr);

		if (document) {
			const coc_explorer =
				extensions.isActivated('coc-explorer') &&
				(document.textDocument.languageId === 'coc-explorer' ||
					basename(document.uri).endsWith('%5Bcoc-explorer%5D-1'));

			icon = resolveIcon(document);

			const { largeImage, largeImageIdle, largeImageInExplorer } = this.client.config;

			this.viewing = true;

			this.presence.details = await this.generateDetails(
				'detailsEditing',
				'detailsIdle',
				coc_explorer ? 'detailsInExplorer' : 'detailsViewing',
				icon,
				document
			);

			this.presence.state = await this.generateDetails(
				'lowerDetailsEditing',
				'lowerDetailsIdle',
				coc_explorer ? 'lowerDetailsInExplorer' : 'lowerDetailsViewing',
				icon,
				document
			);

			this.presence.largeImageKey = coc_explorer ? defaultIcons.standard_neovim_idle : icon;

			this.presence.largeImageText = coc_explorer
				? largeImageInExplorer
				: document.textDocument.uri
				? largeImage
						.replace('{lang}', icon)
						.replace(
							'{Lang}',
							icon.toLowerCase().replace(/^\w/, (c: string) => c.toUpperCase())
						)
						.replace('{LANG}', icon.toUpperCase()) || document.textDocument.languageId.padEnd(2, '\u200b')
				: largeImageIdle;

			await this.checkIdle(true);
			await this.update();
		}
	}

	public async onFileEdit(bufnr: number) {
		let icon = defaultIcons.standard_neovim_idle as string;

		const document = workspace.getDocument(bufnr);

		if (
			!document ||
			!document.uri ||
			basename(document.uri).endsWith('.git') ||
			document.textDocument.languageId === 'scminput'
		) {
			return;
		}

		icon = resolveIcon(document);

		const { largeImage } = this.client.config;

		this.viewing = false;

		this.presence.details = await this.generateDetails('detailsEditing', 'detailsIdle', undefined, icon, document);

		this.presence.state = await this.generateDetails(
			'lowerDetailsEditing',
			'lowerDetailsIdle',
			undefined,
			icon,
			document
		);

		this.presence.largeImageKey = icon;

		this.presence.largeImageText =
			largeImage
				.replace('{lang}', icon)
				.replace(
					'{Lang}',
					icon.toLowerCase().replace(/^\w/, (c: string) => c.toUpperCase())
				)
				.replace('{LANG}', icon.toUpperCase()) || document.textDocument.languageId.padEnd(2, '\u200b');

		await this.checkIdle(true);
		await this.update();
	}

	public async onFileOpen(document: TextDocument) {
		if (document) {
			await this.onFileSwitch(document.uri);
		}
	}

	public async onFileWrite(bufnr: number) {
		await this.onFileEdit(bufnr);
		await this.checkIdle(true);
	}

	public dispose() {
		this.presence = {};
		this.viewing = false;
	}

	private async generateDetails(
		editing: string,
		idling: string,
		viewing: string | undefined,
		largeImageKey: any,
		document: Document
	) {
		const config = this.client.config;
		const filename = workspace.getDocument(document.uri);
		const workspaceFolder = workspace.getWorkspaceFolder(document.uri)?.name;

		let raw = config[idling].replace('{null}', empty);

		if (!filename) {
			return raw;
		}

		raw = config[editing];

		if (this.viewing && viewing) {
			raw = config[viewing];
		}

		const { totalLines, currentLine, currentColumn } = await this.generateFileDetails(raw);
		const { showProblems, problemsText, lowerDetailsNotFound, workspaceText } = this.client.config;

		const problemsCount = diagnosticManager.getDiagnostics(document.uri).length;
		const problems = showProblems ? problemsText.replace('{count}', problemsCount.toString()) : '';

		raw = raw
			.replace('{null}', empty)
			.replace('{filename}', basename(document.uri))
			.replace(
				'{workspace}',
				workspaceFolder
					? workspaceText.replace('{workspace}', workspaceFolder)
					: lowerDetailsNotFound.replace('{null}', empty)
			)
			.replace('{lang}', largeImageKey ? largeImageKey.image || largeImageKey : 'txt')
			.replace(
				'{Lang}',
				largeImageKey
					? (largeImageKey.image || largeImageKey)
							.toLowerCase()
							.replace(/^\w/, (c: string) => c.toUpperCase())
					: 'Txt'
			)
			.replace('{LANG}', largeImageKey ? (largeImageKey.image || largeImageKey).toUpperCase() : 'TXT')
			.replace('{problems}', problems);

		if (totalLines) {
			raw = raw.replace('{totallines}', totalLines);
		}

		if (currentLine) {
			raw = raw.replace('{currentline}', currentLine);
		}

		if (currentColumn) {
			raw = raw.replace('{currentcolumn}', currentColumn);
		}

		return raw;
	}

	private async generateFileDetails(raw?: string) {
		const fileDetail: FileDetail = {};

		if (!raw) {
			return fileDetail;
		}

		if (raw.includes('{totallines}')) {
			fileDetail.totalLines = workspace.getDocument(workspace.uri).lineCount.toLocaleString();
		}

		if (raw.includes('{currentline}')) {
			fileDetail.currentLine = ((await workspace.getCursorPosition()).line + 1).toLocaleString();
		}

		if (raw.includes('{currentcolumn}')) {
			fileDetail.currentColumn = ((await workspace.getCursorPosition()).character + 1).toLocaleString();
		}

		return fileDetail;
	}

	private async checkIdle(focused: boolean) {
		const { idleTimeout, checkIdle } = this.client.config;

		if (!checkIdle) {
			if (idleCheckTimeout) {
				clearTimeout(idleCheckTimeout);
			}

			return;
		}

		if (focused) {
			if (idleCheckTimeout) {
				clearTimeout(idleCheckTimeout);
			}

			await this.idle(false);
		}

		idleCheckTimeout = setTimeout(async () => {
			await this.idle(true);

			idleCheckTimeout = undefined;
		}, idleTimeout * 1000);
	}

	private async idle(status: boolean) {
		const { smallImage, idleText } = this.client.config;

		this.presence.smallImageKey = status ? defaultIcons.standard_idle : defaultIcons.standard_neovim;
		this.presence.smallImageText = status
			? idleText
			: smallImage.replace('{appname}', isNeoVim).replace('{appversion}', workspace.env.version);

		await this.update();
	}

	private async update() {
		await this.client.setActivity(this.presence);
	}
}
