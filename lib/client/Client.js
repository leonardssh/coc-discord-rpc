"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const coc_nvim_1 = require("coc.nvim");
const discord_rpc_1 = require("discord-rpc");
const Logger_1 = require("../structures/Logger");
const Activity_1 = __importDefault(require("../structures/Activity"));
let activityTimer = undefined;
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
            value: undefined
        });
        Object.defineProperty(this, "ready", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "activity", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Activity_1.default(this)
        });
    }
    async connect() {
        this.dispose();
        this.rpc = new discord_rpc_1.Client({ transport: 'ipc' });
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
            if (!this.config.get('hideStartupMessage')) {
                Logger_1.log('Logging into RPC...', Logger_1.LogLevel.Info);
            }
            await this.rpc.login({ clientId: this.config.get('id') });
        }
        catch (error) {
            throw error;
        }
    }
    handleReady() {
        this.ready = true;
        if (!this.config.get('hideStartupMessage')) {
            Logger_1.log('Successfully connected to Discord Gateway.', Logger_1.LogLevel.Info);
        }
        if (activityTimer) {
            clearInterval(activityTimer);
        }
        void this.setActivity(this.config.get('workspaceElapsedTime'));
        activityTimer = setInterval(() => {
            this.config = coc_nvim_1.workspace.getConfiguration('rpc');
            void this.setActivity(this.config.get('workspaceElapsedTime'));
        }, 1000);
    }
    async setActivity(workspaceElapsedTime = false) {
        if (!this.rpc || !this.ready) {
            return;
        }
        const activity = await this.activity.generate(workspaceElapsedTime);
        if (!activity) {
            return;
        }
        this.rpc.setActivity(activity).catch(() => this.dispose());
    }
    dispose() {
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
    disconnect() {
        this.dispose();
        Logger_1.log(`Successfully disconnected from Discord Gateway`, Logger_1.LogLevel.Info);
    }
}
exports.default = Client;
//# sourceMappingURL=Client.js.map