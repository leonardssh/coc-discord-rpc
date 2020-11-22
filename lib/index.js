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
    if (config.get('enabled') && !config.get('hideStartupMessage')) {
        Logger_1.log('Extension activated, trying to connect to Discord Gateway', Logger_1.LogLevel.Info);
    }
    await client.connect(ctx);
};
exports.deactivate = async () => {
    Logger_1.log('Extension deactivated, trying to disconnect from Discord Gateway', Logger_1.LogLevel.Info);
    return client.disconnect();
};
process.on('unhandledRejection', (err) => Logger_1.log(err, Logger_1.LogLevel.Err));
//# sourceMappingURL=index.js.map