"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const Client_1 = __importDefault(require("./client/Client"));
const Logger_1 = require("./structures/Logger");
const coc_nvim_1 = require("coc.nvim");
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
    if (config.get('enabled') && !isWorkspaceExcluded) {
        if (!config.get('hideStartupMessage')) {
            Logger_1.log('Extension activated, trying to connect to Discord Gateway', Logger_1.LogLevel.Info);
        }
        await client.connect(ctx);
    }
};
exports.deactivate = async () => {
    Logger_1.log('Extension deactivated, trying to disconnect from Discord Gateway', Logger_1.LogLevel.Info);
    return client.disconnect();
};
process.on('unhandledRejection', (err) => Logger_1.log(err, Logger_1.LogLevel.Err));
//# sourceMappingURL=index.js.map