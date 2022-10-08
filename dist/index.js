"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const coc_nvim_1 = require("coc.nvim");
const activity_1 = require("./activity");
const listener_1 = require("./listener");
const logger_1 = require("./logger");
const client_1 = require("./client");
const Commands = __importStar(require("./commands"));
const util_1 = require("./util");
const extensionName = process.env.EXTENSION_NAME || "dev.coc-discord-rpc";
const extensionVersion = process.env.EXTENSION_VERSION || "0.0.0";
const config = (0, util_1.getConfig)();
const activate = async (ctx) => {
    ctx.logger.info(`=== Extension activated ===`);
    ctx.logger.info(`Extension Name: ${extensionName}.`);
    ctx.logger.info(`Extension Version: ${extensionVersion}.`);
    activity_1.ActivityController.setExtensionContext(ctx);
    let isWorkspaceIgnored = false;
    for (const pattern of config["ignoreWorkspaces" /* CONFIG_KEYS.IgnoreWorkspaces */]) {
        const regex = new RegExp(pattern);
        const folders = coc_nvim_1.workspace.workspaceFolders;
        if (!folders) {
            break;
        }
        if (folders.some((folder) => regex.test(folder.name))) {
            isWorkspaceIgnored = true;
            break;
        }
    }
    const enableCommand = coc_nvim_1.commands.registerCommand(Commands.ENABLE_RPC, async () => {
        await config.update("enabled", true);
        listener_1.ListenerController.reset();
        await client_1.ClientController.login(ctx);
        if (config["suppressNotifications" /* CONFIG_KEYS.SuppressNotifications */]) {
            await (0, logger_1.logInfo)(`Enabled Discord Rich Presence for this workspace.`);
        }
    });
    const disableCommand = coc_nvim_1.commands.registerCommand(Commands.DISABLE_RPC, async () => {
        await config.update("enabled", false);
        listener_1.ListenerController.reset();
        await client_1.ClientController.rpc.destroy();
        if (config["suppressNotifications" /* CONFIG_KEYS.SuppressNotifications */]) {
            await (0, logger_1.logInfo)(`Disabled Discord Rich Presence for this workspace.`);
        }
    });
    const disconnectCommand = coc_nvim_1.commands.registerCommand(Commands.DISCONNECT_RPC, async () => {
        listener_1.ListenerController.reset();
        await client_1.ClientController.rpc.destroy();
    });
    const reconnectCommand = coc_nvim_1.commands.registerCommand(Commands.RECONNECT_RPC, async () => {
        listener_1.ListenerController.reset();
        await client_1.ClientController.rpc.destroy();
        await client_1.ClientController.login(ctx);
    });
    const versionCommand = coc_nvim_1.commands.registerCommand(Commands.VERSION_RPC, async () => {
        await (0, logger_1.logInfo)(`v${extensionVersion}`);
    });
    ctx.subscriptions.push(enableCommand, disableCommand, reconnectCommand, disconnectCommand, versionCommand);
    if (!isWorkspaceIgnored && config["enabled" /* CONFIG_KEYS.Enabled */]) {
        await client_1.ClientController.login(ctx);
    }
};
exports.activate = activate;
const deactivate = async (ctx) => {
    ctx.logger.info(`=== Extension deactivated ===`);
    listener_1.ListenerController.reset();
    await client_1.ClientController.rpc.destroy();
};
exports.deactivate = deactivate;
process.on("unhandledRejection", (error) => (0, logger_1.logError)(`RPC: ${error}`));
