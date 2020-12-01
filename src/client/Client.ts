import { Disposable, workspace, WorkspaceConfiguration } from 'coc.nvim';
import { Client as RPClient } from 'discord-rpc';
import { log, LogLevel } from '../structures/Logger';

import Activity from '../structures/Activity';

// eslint-disable-next-line @typescript-eslint/init-declarations
let activityTimer: NodeJS.Timer | undefined;

export default class Client implements Disposable {
	private rpc?: any;

	private readonly activity = new Activity(this);

	public constructor(public config: WorkspaceConfiguration) {}

	public async connect() {
		if (this.rpc) {
			await this.dispose();
		}

		this.rpc = new RPClient({ transport: 'ipc' });

		this.rpc.once('ready', () => this.ready());

		try {
			if (!this.config.get<boolean>('hideStartupMessage')) {
				log('Logging into RPC...', LogLevel.Info);
			}

			await this.rpc.login({ clientId: this.config.get<string>('id')! });
		} catch (error) {
			throw error;
		}
	}

	public ready() {
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
		this.activity.dispose();

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
}
