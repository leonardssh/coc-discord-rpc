import type { Disposable, ExtensionContext, WorkspaceConfiguration } from 'coc.nvim';
import { Client as RPC, Presence } from 'discord-rpc';
import { Activity } from './activity';
import { Listener } from './listener';
import { logInfo } from './logger';

export class Client implements Disposable {
	private rpc?: RPC;

	private ready?: boolean = false;

	private activity: Activity;

	private listener: Listener;

	public constructor(public config: WorkspaceConfiguration) {
		this.activity = new Activity(this);
		this.listener = new Listener(this.activity);
	}

	public async connect(ctx: ExtensionContext) {
		await this.dispose();

		this.rpc = new RPC({ transport: 'ipc' });

		this.ready = false;

		this.rpc.once('ready', () => this.handleReady(ctx));

		this.rpc.transport.once('close', () => this.handleTransport());

		try {
			const { id } = this.config;

			await this.rpc.login({ clientId: id });
		} catch (error) {
			throw error;
		}
	}

	public async handleTransport() {
		const { enabled } = this.config;

		if (!enabled) {
			return;
		}

		await this.dispose();
	}

	public async handleReady(ctx: ExtensionContext) {
		this.ready = true;

		const { logger } = ctx;

		logger.info('Connected to Discord Gateway!');
		logInfo('Connected to Discord Gateway!');

		this.listener.listen();
		await this.activity.init();
	}

	public async setActivity(presence: Presence) {
		if (!this.rpc || !this.ready) {
			return;
		}

		await this.rpc.setActivity(presence).catch(() => this.dispose());
	}

	public async dispose() {
		this.activity.dispose();
		this.listener.dispose();

		if (this.rpc && this.ready) {
			await this.rpc.destroy();
		}

		this.rpc = undefined;
		this.ready = false;
	}
}

declare module 'discord-rpc' {
	interface Client {
		transport: {
			once(event: 'close', listener: () => void): void;
		};
	}
}
