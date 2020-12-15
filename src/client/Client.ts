import { Disposable, workspace, WorkspaceConfiguration } from 'coc.nvim';
import { Client as RPClient } from 'discord-rpc';
import { log, LogLevel } from '../structures/Logger';

import Activity from '../structures/Activity';

let activityTimer: NodeJS.Timer | undefined = undefined;

export default class Client implements Disposable {
	private rpc?: any = undefined;

	private ready = false;

	private readonly activity = new Activity(this);

	public constructor(public config: WorkspaceConfiguration) {}

	public async connect() {
		this.dispose();

		this.rpc = new RPClient({ transport: 'ipc' });

		this.ready = false;

		this.rpc.transport.once('close', () => {
			const { enabled } = this.config;

			if (!enabled) {
				return;
			}

			this.dispose();
		});

		this.rpc.once('ready', () => this.handleReady());

		try {
			if (!this.config.get<boolean>('hideStartupMessage')) {
				log('Logging into RPC...', LogLevel.Info);
			}

			await this.rpc.login({ clientId: this.config.get<string>('id')! });
		} catch (error) {
			throw error;
		}
	}

	public handleReady() {
		this.ready = true;

		if (!this.config.get<boolean>('hideStartupMessage')) {
			log('Successfully connected to Discord Gateway.', LogLevel.Info);
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
		if (!this.rpc || !this.ready) {
			return;
		}

		const activity = await this.activity.generate(workspaceElapsedTime);

		if (!activity) {
			return;
		}

		this.rpc.setActivity(activity).catch(() => this.dispose());
	}

	public dispose() {
		this.activity.dispose();

		if (this.rpc && this.ready) {
			this.rpc.destroy();
		}

		this.rpc = undefined;
		this.ready = false;

		if (activityTimer) {
			clearInterval(activityTimer);
		}
	}

	public disconnect() {
		this.dispose();
		log(`Successfully disconnected from Discord Gateway`, LogLevel.Info);
	}
}
