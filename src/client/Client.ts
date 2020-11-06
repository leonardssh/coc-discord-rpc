import { commands, Disposable, ExtensionContext, workspace } from 'coc.nvim';
import { Client as RPClient } from 'discord-rpc';
import { log, LogLevel } from '../structures/Logger';
import { getActivity } from '../structures/Activity';
import { version } from '../version/version';

// eslint-disable-next-line @typescript-eslint/init-declarations
let activityTimer: NodeJS.Timer | undefined;

export default class Client implements Disposable {
	private rpc?: RPClient;

	public constructor(private readonly clientId: string) {}

	public get client() {
		return this.rpc;
	}

	public async connect(ctx?: ExtensionContext) {
		if (this.rpc) {
			await this.dispose();
		}

		this.rpc = new RPClient({ transport: 'ipc' });

		log('Logging into RPC...', LogLevel.Info);

		this.rpc.once('ready', () => this.ready(ctx));

		try {
			await this.rpc.login({ clientId: this.clientId });
		} catch (error) {
			throw error;
		}
	}

	public ready(ctx?: ExtensionContext) {
		log('Successfully connected to Discord Gateway.', LogLevel.Info);

		if (ctx) {
			this.registerCommands(ctx);
		}

		if (activityTimer) {
			clearInterval(activityTimer);
		}

		this.setActivity();
	}

	public setActivity() {
		if (!this.rpc) {
			return;
		}

		const startTimestamp = new Date();

		activityTimer = setInterval(() => {
			const workspaceName = workspace.root.split('/').pop();
			const fileName = workspace.getDocument(workspace.uri)?.uri.split('/').pop();

			void this.rpc!.setActivity(getActivity(startTimestamp, workspaceName, fileName));
		}, 1000);
	}

	public async dispose() {
		if (this.rpc) {
			await this.rpc.destroy();
		}

		this.rpc = undefined;

		if (activityTimer) {
			clearInterval(activityTimer);
		}
	}

	public async disconnect() {
		await this.dispose();
		log(`Successfully disconnected from Discord Gateway`, LogLevel.Info);
	}

	private registerCommands(ctx: ExtensionContext) {
		ctx.subscriptions.push(
			commands.registerCommand('rpc.disconnect', () => {
				log(`Trying to disconnect from Discord Gateway`, LogLevel.Info);
				void this.disconnect();
			})
		);

		ctx.subscriptions.push(
			commands.registerCommand('rpc.connect', () => {
				log(`Trying to connect to Discord Gateway`, LogLevel.Info);
				void this.connect(ctx);
			})
		);

		ctx.subscriptions.push(
			commands.registerCommand('rpc.version', () => {
				log(`v${version}`, LogLevel.Info);
			})
		);
	}
}
