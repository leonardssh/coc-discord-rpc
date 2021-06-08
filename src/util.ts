/* eslint-disable prefer-destructuring */
import { exec } from 'child_process';
import { Document, workspace, WorkspaceConfiguration } from 'coc.nvim';
import { basename } from 'path';
import { promisify } from 'util';
import icon from './icons.json';

const asyncExec = promisify(exec);

type WorkspaceExtensionConfiguration = WorkspaceConfiguration & {
	enabled: boolean;
	suppressNotifications: boolean;
	clientId: string;
	detailsEditing: string;
	detailsViewing: string;
	detailsIdling: string;
	lowerDetailsEditing: string;
	lowerDetailsViewing: string;
	lowerDetailsIdling: string;
	lowerDetailsNotFound: string;
	largeImage: string;
	largeImageIdling: string;
	smallImage: string;
	showProblems: boolean;
	problemsText: string;
	workspaceElapsedTime: boolean;
	ignoreWorkspaces: string[];
	buttonEnable: boolean;
	buttonActiveLabel: string;
	buttonInactiveLabel: string;
	buttonInactiveUrl: string;
};

export function getConfig() {
	return workspace.getConfiguration('rpc') as WorkspaceExtensionConfiguration;
}

export async function getGitRepo(): Promise<string | null> {
	try {
		const isInit = await asyncExec('git rev-parse --git-dir');

		if (!isInit.stdout.trim()) {
			return null;
		}

		const remoteUrl = await asyncExec('git config --get remote.origin.url');

		if (!remoteUrl.stdout) {
			return null;
		}

		const matched =
			/^(?:git@|https?:\/\/)(?<provider>[a-zA-Z_.~-]+\.[a-z]{2,})(?::|\/)(?<user>.*?)\/(?<repo>.*)$/.exec(
				remoteUrl.stdout.trim()
			);

		if (!matched || !matched.groups?.provider || !matched.groups?.user || !matched.groups?.repo) {
			return null;
		}

		return `https://${matched.groups.provider}/${matched.groups.user}/${matched.groups.repo}`;
	} catch {
		return null;
	}
}

const knownExtensions: { [key: string]: { image: string } } = icon.knownExtensions;
const knownLanguages: string[] = icon.knownLanguages;

export function resolveFileIcon(document: Document) {
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
}
