"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const Client_1 = __importDefault(require("./client/Client"));
const Logger_1 = require("./structures/Logger");
const coc_nvim_1 = require("coc.nvim");
const version_1 = require("./version/version");
const config = coc_nvim_1.workspace.getConfiguration('rpc');
const client = new Client_1.default(config);
exports.activate = async (ctx) => {
    const workspaceName = coc_nvim_1.workspace.root.split('/').pop();
    const excludePatterns = config.get('ignoreWorkspaces');
    let isWorkspaceExcluded = false;
    if (excludePatterns === null || excludePatterns === void 0 ? void 0 : excludePatterns.length) {
        for (const pattern of excludePatterns) {
            const regex = new RegExp(pattern);
            const folders = coc_nvim_1.workspace.workspaceFolders;
            if (!folders && !workspaceName) {
                break;
            }
            if (folders.some((folder) => regex.test(folder.name)) || regex.test(workspaceName)) {
                isWorkspaceExcluded = true;
                break;
            }
        }
    }
    const enableCommand = coc_nvim_1.commands.registerCommand('rpc.disable', () => {
        config.update('enabled', false);
        client.config = coc_nvim_1.workspace.getConfiguration('rpc');
        void client.dispose();
        Logger_1.log(`Disabled Discord Rich Presence for this workspace.`, Logger_1.LogLevel.Info);
    });
    const disableCommand = coc_nvim_1.commands.registerCommand('rpc.enable', () => {
        void client.dispose();
        config.update('enabled', true);
        client.config = coc_nvim_1.workspace.getConfiguration('rpc');
        void client.connect();
        Logger_1.log(`Enabled Discord Rich Presence for this workspace.`, Logger_1.LogLevel.Info);
    });
    const disconnectCommand = coc_nvim_1.commands.registerCommand('rpc.disconnect', () => {
        Logger_1.log(`Trying to disconnect from Discord Gateway`, Logger_1.LogLevel.Info);
        void client.disconnect();
    });
    const reconnectCommand = coc_nvim_1.commands.registerCommand('rpc.reconnect', () => {
        Logger_1.log(`Trying to reconnect to Discord Gateway`, Logger_1.LogLevel.Info);
        void client.connect();
    });
    const versionCommand = coc_nvim_1.commands.registerCommand('rpc.version', () => {
        Logger_1.log(`v${version_1.version}`, Logger_1.LogLevel.Info);
    });
    ctx.subscriptions.push(enableCommand, disableCommand, reconnectCommand, disconnectCommand, versionCommand);
    if (config.get('enabled') && !isWorkspaceExcluded) {
        if (!config.get('hideStartupMessage')) {
            Logger_1.log('Extension activated, trying to connect to Discord Gateway', Logger_1.LogLevel.Info);
        }
        try {
            await client.connect();
        }
        catch (error) {
            Logger_1.log(error, Logger_1.LogLevel.Err);
            void client.dispose();
        }
    }
};
exports.deactivate = async () => {
    Logger_1.log('Extension deactivated, trying to disconnect from Discord Gateway', Logger_1.LogLevel.Info);
    return client.disconnect();
};
process.on('unhandledRejection', (err) => Logger_1.log(err, Logger_1.LogLevel.Err));
//# sourceMappingURL=index.js.map