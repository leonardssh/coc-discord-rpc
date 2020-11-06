/* eslint-disable prefer-destructuring */
import type { Presence } from 'discord-rpc';

import lang from '../language/languages.json';

const knownExtensions: { [key: string]: { image: string } } = lang.knownExtensions;

export const getActivity = (startTimestamp: number | Date, workspace?: string, fileName?: string): Presence => {
	let state: Presence = {
		details: 'Idling',
		state: 'Idling',
		smallImageKey: 'neovim-logo',
		smallImageText: 'NeoVim',
		largeImageKey: 'neovim-logo',
		largeImageText: 'NeoVim'
	};

	if (!workspace || !fileName) {
		return state;
	}

	let largeImageKey: any = 'neovim-logo';

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
		];

	state = {
		...state,
		details: `Workspace: ${workspace}`,
		state: `Editing ${fileName}`,
		startTimestamp,
		largeImageKey: largeImageKey ? largeImageKey.image || largeImageKey : 'neovim-logo',
		largeImageText: `Editing a ${largeImageKey ? (largeImageKey.image || largeImageKey).toUpperCase() : 'TXT'} file`
	};

	return state;
};
