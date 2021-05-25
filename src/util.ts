import { exec } from 'child_process';
import { promisify } from 'util';

const asyncExec = promisify(exec);

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

		const matched = /^(?:git@|https?:\/\/)(?<provider>[a-zA-Z_.~-]+\.[a-z]{2,})(?::|\/)(?<user>.*?)\/(?<repo>.*)$/.exec(
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
