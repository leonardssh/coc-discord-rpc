import { commands, Disposable, ExtensionContext, workspace, WorkspaceConfiguration } from 'coc.nvim';
import { Client as RPClient } from 'discord-rpc';
import { log, LogLevel } from '../structures/Logger';
import { version } from '../version/version';

import Activity from '../structures/Activity';

// eslint-disable-next-line @typescript-eslint/init-declarations
let activityTimer: NodeJS.Timer | undefined;

export default class Client implements Disposable {
	private rpc?: any;

	private readonly activity = new Activity(this);

	public constructor(public config: WorkspaceConfiguration) {}

	public async connect(ctx?: ExtensionContext, _log = true) {
		if (this.rpc) {
			await this.dispose();
		}

		this.rpc = new RPClient({ transport: 'ipc' });

		this.rpc.once('ready', () => this.ready(ctx, _log));

		try {
			if (!this.config.get<boolean>('hideStartupMessage')) {
				log('Logging into RPC...', LogLevel.Info);
			}

			await this.rpc.login({ clientId: this.config.get<string>('id')! });
		} catch (error) {
			log(error, LogLevel.Err);
		}
	}

	public ready(ctx?: ExtensionContext, _log = true) {
		if (!this.config.get<boolean>('hideStartupMessage') && _log) {
			log('Successfully connected to Discord Gateway.', LogLevel.Info);
		}

		if (ctx) {
			this.registerCommands(ctx);
		}

		if (activityTimer) {
			clearInterval(activityTimer);
		}

		void this.setActivity(this.config.get<boolean>('workspaceElapsedTime'));

		activityTimer = setInterval(() => {
			this.config = workspace.getConfiguration('rpc');

			void this.setActivity(this.config.get<boolean>('workspaceElapsedTime'));
		}, 1000);
	}

	public async setActivity(workspaceElapsedTime = false) {
		if (!this.rpc) {
			return;
		}

		const activity = await this.activity.generate(workspaceElapsedTime);

		if (!activity) {
			return;
		}

		this.rpc.setActivity(activity);
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
			commands.registerCommand('rpc.reconnect', () => {
				log(`Trying to reconnect to Discord Gateway`, LogLevel.Info);
				void this.connect(ctx);
			})
		);

		ctx.subscriptions.push(
			commands.registerCommand('rpc.version', () => {
				log(`v${version}`, LogLevel.Info);
			})
		);

		ctx.subscriptions.push(
			commands.registerCommand('rpc.enable', () => {
				void this.dispose();

				this.config.update('enabled', true);
				this.config = workspace.getConfiguration('rpc');

				void this.connect(ctx, false);

				log(`Enabled Discord Rich Presence for this workspace.`, LogLevel.Info);
			})
		);

		ctx.subscriptions.push(
			commands.registerCommand('rpc.disable', () => {
				this.config.update('enabled', false);
				this.config = workspace.getConfiguration('rpc');

				void this.dispose();

				log(`Disabled Discord Rich Presence for this workspace.`, LogLevel.Info);
			})
		);
	}
}
