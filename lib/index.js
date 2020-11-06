"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const Client_1 = __importDefault(require("./client/Client"));
const Logger_1 = require("./structures/Logger");
const clientId = '768090036633206815';
const client = new Client_1.default(clientId);
exports.activate = async (ctx) => {
    Logger_1.log('Extension activated, trying to connect to Discord gateway', Logger_1.LogLevel.Info);
    await client.connect(ctx);
};
exports.deactivate = async () => {
    Logger_1.log('Extension deactivated, trying to disconnect from Discord gateway', Logger_1.LogLevel.Info);
    return client.disconnect();
};
process.on('unhandledRejection', (err) => Logger_1.log(err, Logger_1.LogLevel.Err));
//# sourceMappingURL=index.js.map