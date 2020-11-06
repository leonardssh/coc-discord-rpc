"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const coc_nvim_1 = require("coc.nvim");
const discord_rpc_1 = require("discord-rpc");
const Logger_1 = require("../structures/Logger");
const Activity_1 = require("../structures/Activity");
const version_1 = require("../version/version");
// eslint-disable-next-line @typescript-eslint/init-declarations
let activityTimer;
class Client {
    constructor(clientId) {
        Object.defineProperty(this, "clientId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: clientId
        });
        Object.defineProperty(this, "rpc", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    get client() {
        return this.rpc;
    }
    async connect(ctx) {
        if (this.rpc) {
            await this.dispose();
        }
        this.rpc = new discord_rpc_1.Client({ transport: 'ipc' });
        Logger_1.log('Logging into RPC...', Logger_1.LogLevel.Info);
        this.rpc.once('ready', () => this.ready(ctx));
        try {
            await this.rpc.login({ clientId: this.clientId });
        }
        catch (error) {
            throw error;
        }
    }
    ready(ctx) {
        Logger_1.log('Successfully connected to Discord Gateway.', Logger_1.LogLevel.Info);
        if (ctx) {
            this.registerCommands(ctx);
        }
        if (activityTimer) {
            clearInterval(activityTimer);
        }
        this.setActivity();
    }
    setActivity() {
        if (!this.rpc) {
            return;
        }
        const startTimestamp = new Date();
        activityTimer = setInterval(() => {
            var _a;
            const workspaceName = coc_nvim_1.workspace.root.split('/').pop();
            const fileName = (_a = coc_nvim_1.workspace.getDocument(coc_nvim_1.workspace.uri)) === null || _a === void 0 ? void 0 : _a.uri.split('/').pop();
            void this.rpc.setActivity(Activity_1.getActivity(startTimestamp, workspaceName, fileName));
        }, 1000);
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
        ctx.subscriptions.push(coc_nvim_1.commands.registerCommand('rpc.connect', () => {
            Logger_1.log(`Trying to connect to Discord Gateway`, Logger_1.LogLevel.Info);
            void this.connect(ctx);
        }));
        ctx.subscriptions.push(coc_nvim_1.commands.registerCommand('rpc.version', () => {
            Logger_1.log(`v${version_1.version}`, Logger_1.LogLevel.Info);
        }));
    }
}
exports.default = Client;
//# sourceMappingURL=Client.js.map