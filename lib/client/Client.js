"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const coc_nvim_1 = require("coc.nvim");
const discord_rpc_1 = require("discord-rpc");
const Logger_1 = require("../structures/Logger");
const version_1 = require("../version/version");
const Activity_1 = __importDefault(require("../structures/Activity"));
// eslint-disable-next-line @typescript-eslint/init-declarations
let activityTimer;
class Client {
    constructor(config) {
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: config
        });
        Object.defineProperty(this, "rpc", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "activity", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Activity_1.default(this)
        });
    }
    async connect(ctx, _log = true) {
        if (this.rpc) {
            await this.dispose();
        }
        this.rpc = new discord_rpc_1.Client({ transport: 'ipc' });
        this.rpc.once('ready', () => this.ready(ctx, _log));
        const workspaceName = coc_nvim_1.workspace.root.split('/').pop();
        if (this.config.get('enabled') &&
            !this.isWorkspaceIgnored(workspaceName, this.config.get('ignoreWorkspaces'))) {
            try {
                if (!this.config.get('hideStartupMessage')) {
                    Logger_1.log('Logging into RPC...', Logger_1.LogLevel.Info);
                }
                await this.rpc.login({ clientId: this.config.get('id') });
            }
            catch (error) {
                Logger_1.log(error, Logger_1.LogLevel.Err);
            }
        }
    }
    ready(ctx, _log = true) {
        if (!this.config.get('hideStartupMessage') && _log) {
            Logger_1.log('Successfully connected to Discord Gateway.', Logger_1.LogLevel.Info);
        }
        if (ctx) {
            this.registerCommands(ctx);
        }
        if (activityTimer) {
            clearInterval(activityTimer);
        }
        void this.setActivity();
        activityTimer = setInterval(() => {
            this.config = coc_nvim_1.workspace.getConfiguration('rpc');
            void this.setActivity();
        }, 1000);
    }
    async setActivity() {
        if (!this.rpc) {
            return;
        }
        const activity = await this.activity.generate();
        if (!activity) {
            return;
        }
        void this.rpc.setActivity(activity);
    }
    async dispose() {
        if (this.rpc) {
            await this.rpc.destroy();
        }
        this.rpc = undefined;
        if (activityTimer) {
            clearInterval(activityTimer);
        }
    }
    async disconnect() {
        await this.dispose();
        Logger_1.log(`Successfully disconnected from Discord Gateway`, Logger_1.LogLevel.Info);
    }
    registerCommands(ctx) {
        ctx.subscriptions.push(coc_nvim_1.commands.registerCommand('rpc.disconnect', () => {
            Logger_1.log(`Trying to disconnect from Discord Gateway`, Logger_1.LogLevel.Info);
            void this.disconnect();
        }));
        ctx.subscriptions.push(coc_nvim_1.commands.registerCommand('rpc.reconnect', () => {
            Logger_1.log(`Trying to reconnect to Discord Gateway`, Logger_1.LogLevel.Info);
            void this.connect(ctx);
        }));
        ctx.subscriptions.push(coc_nvim_1.commands.registerCommand('rpc.version', () => {
            Logger_1.log(`v${version_1.version}`, Logger_1.LogLevel.Info);
        }));
        ctx.subscriptions.push(coc_nvim_1.commands.registerCommand('rpc.enable', () => {
            void this.dispose();
            this.config.update('enabled', true);
            this.config = coc_nvim_1.workspace.getConfiguration('rpc');
            void this.connect(ctx, false);
            Logger_1.log(`Enabled Discord Rich Presence for this workspace.`, Logger_1.LogLevel.Info);
        }));
        ctx.subscriptions.push(coc_nvim_1.commands.registerCommand('rpc.disable', () => {
            this.config.update('enabled', false);
            this.config = coc_nvim_1.workspace.getConfiguration('rpc');
            void this.dispose();
            Logger_1.log(`Disabled Discord Rich Presence for this workspace.`, Logger_1.LogLevel.Info);
        }));
    }
    isWorkspaceIgnored(workspaceName, expressions) {
        for (const expression of expressions) {
            if (new RegExp(`/${expression}/`).test(workspaceName)) {
                return true;
            }
        }
        return false;
    }
}
exports.default = Client;
//# sourceMappingURL=Client.js.map