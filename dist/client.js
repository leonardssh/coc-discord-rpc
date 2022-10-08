"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientController = void 0;
const constants_1 = require("./constants");
const listener_1 = require("./listener");
const activity_1 = require("./activity");
const discord_rpc_1 = require("@xhayper/discord-rpc");
const logger_1 = require("./logger");
const util_1 = require("./util");
const config = (0, util_1.getConfig)();
class ClientController {
    static rpc = new discord_rpc_1.Client({
        clientId: config["clientId" /* CONFIG_KEYS.ClientId */],
        transport: { pathList: constants_1.FORMAT_FUNCTION_LIST }
    });
    static async login(ctx) {
        ClientController.rpc = new discord_rpc_1.Client({
            clientId: config["clientId" /* CONFIG_KEYS.ClientId */],
            transport: { pathList: constants_1.FORMAT_FUNCTION_LIST }
        });
        ClientController.rpc.once("ready", () => ClientController.handleLogin(ctx));
        ClientController.rpc.once("disconnected", () => ClientController.handleDisconnected(ctx));
        try {
            await ClientController.rpc.login();
        }
        catch (error) {
            ctx.logger.error(error);
            listener_1.ListenerController.reset();
            await ClientController.rpc.destroy();
        }
    }
    static async handleLogin(ctx) {
        ctx.logger.info("Connected to Discord Gateway");
        if (config["suppressNotifications" /* CONFIG_KEYS.SuppressNotifications */]) {
            await (0, logger_1.logInfo)("Connected to Discord Gateway!");
        }
        listener_1.ListenerController.reset();
        await activity_1.ActivityController.sendActivity();
        listener_1.ListenerController.listen();
    }
    static async handleDisconnected(ctx) {
        ctx.logger.info("Disconnected from Discord Gateway");
        if (config["suppressNotifications" /* CONFIG_KEYS.SuppressNotifications */]) {
            await (0, logger_1.logInfo)("Disconnected from Discord Gateway!");
        }
        listener_1.ListenerController.reset();
        await ClientController.rpc.destroy();
    }
}
exports.ClientController = ClientController;
