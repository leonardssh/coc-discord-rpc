/* eslint-disable prefer-destructuring */
import type { Presence } from 'discord-rpc';

import type RPClient from '../client/Client';

import { Disposable, workspace, diagnosticManager } from 'coc.nvim';

import lang from '../language/languages.json';

interface FileDetail {
	totalLines?: string;
	currentLine?: string;
	currentColumn?: string;
}

const knownExtensions: { [key: string]: { image: string } } = lang.knownExtensions;
const knownLanguages: string[] = lang.knownLanguages;

const empty = '\u200b\u200b';

export default class Activity implements Disposable {
	private _state: Presence | undefined;

	public constructor(private readonly client: RPClient) {}

	public async generate() {
		let largeImageKey: any = 'neovim-logo';

		const workspaceName = workspace.root.split('/').pop();
		const fileName = workspace.getDocument(workspace.uri)?.uri.split('/').pop();

		if (fileName) {
			if (fileName.endsWith('%5Bcoc-explorer%5D-1')) {
				return this._state;
			}

			// https://github.com/iCrawl/discord-vscode/blob/master/src/structures/Activity.ts#L80
			largeImageKey =
				knownExtensions[
					Object.keys(knownExtensions).find((key) => {
						if (fileName.endsWith(key)) {
							return true;
						}

						const match = /^\/(.*)\/([mgiy]+)$/.exec(key);

						if (!match) {
							return false;
						}

						const regex = new RegExp(match[1], match[2]);
						return regex.test(fileName);
					})!
				] ??
				(knownLanguages.includes((await workspace.getCurrentState()).document.languageId)
					? (await workspace.getCurrentState()).document.languageId
					: null);
		}

		let previousTimestamp = undefined;

		if (this._state?.startTimestamp) {
			previousTimestamp = this._state.startTimestamp;
		}

		const languageId = (await workspace.getCurrentState()).document.languageId.padEnd(2, '\u200b');

		this._state = {
			...this._state,
			startTimestamp:
				workspaceName && fileName && previousTimestamp
					? previousTimestamp
					: workspaceName && fileName
					? new Date().getTime()
					: undefined,
			details: await this._generateDetails('detailsEditing', 'detailsIdle', largeImageKey),
			state: await this._generateDetails('lowerDetailsEditing', 'lowerDetailsIdle', largeImageKey),
			smallImageKey: 'neovim-logo',
			smallImageText: this.client.config.get<string>('smallImage')!.replace('{appname}', 'NeoVim'),
			largeImageKey: largeImageKey ? largeImageKey.image || largeImageKey : 'text',
			largeImageText:
				workspaceName && fileName
					? this.client.config
							.get<string>('largeImage')!
							.replace('{lang}', largeImageKey ? largeImageKey.image || largeImageKey : 'txt')
							.replace(
								'{Lang}',
								largeImageKey
									? (largeImageKey.image || largeImageKey)
											.toLowerCase()
											.replace(/^\w/, (c: string) => c.toUpperCase())
									: 'Txt'
							)
							.replace(
								'{LANG}',
								largeImageKey ? (largeImageKey.image || largeImageKey).toUpperCase() : 'TXT'
							) || languageId
					: this.client.config.get<string>('largeImageIdle')
		};

		return this._state;
	}

	public dispose() {
		this._state = undefined;
	}

	private async _generateDetails(editing: string, idling: string, largeImageKey: any) {
		let raw = this.client.config.get<string>(idling)!.replace('{null}', empty);

		const filename = workspace.getDocument(workspace.uri)?.uri.split('/').pop();
		const workspaceFolder = workspace.root.split('/').pop();

		if (!workspaceFolder || !filename) {
			return raw;
		}

		raw = this.client.config.get<string>(editing)!;

		const { totalLines, currentLine, currentColumn } = await this._generateFileDetails(raw);
		const problemsCount = diagnosticManager.getDiagnostics(workspace.uri).length;
		const problems = this.client.config.get<boolean>('showProblems')
			? this.client.config.get<string>('problemsText')!.replace('{count}', problemsCount.toString())
			: '';

		raw = raw
			.replace('{null}', empty)
			.replace('{filename}', filename)
			.replace('{workspace}', workspaceFolder)
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

	private async _generateFileDetails(raw?: string) {
		const fileDetail: FileDetail = {};

		if (!raw) {
			return fileDetail;
		}

		if (workspace.getDocument(workspace.uri)?.uri.split('/').pop()) {
			if (raw.includes('{totallines}')) {
				fileDetail.totalLines = workspace.getDocument(workspace.uri).lineCount.toLocaleString();
			}

			if (raw.includes('{currentline}')) {
				fileDetail.currentLine = ((await workspace.getCursorPosition()).line + 1).toLocaleString();
			}

			if (raw.includes('{currentcolumn}')) {
				fileDetail.currentColumn = ((await workspace.getCursorPosition()).character + 1).toLocaleString();
			}
		}

		return fileDetail;
	}
}
