import "source-map-support/register";

import { type ExtensionContext, commands, workspace } from "coc.nvim";
import { ActivityController } from "./activity";
import { ListenerController } from "./listener";
import { logError, logInfo } from "./logger";
import { ClientController } from "./client";
import { CONFIG_KEYS } from "./constants";
import * as Commands from "./commands";
import { getConfig } from "./util";

const config = getConfig();

export const activate = async (ctx: ExtensionContext) => {
    ctx.logger.info("coc-discord-rpc is activated!");

    ActivityController.setExtensionContext(ctx);

    let isWorkspaceIgnored = false;

    for (const pattern of config[CONFIG_KEYS.IgnoreWorkspaces]) {
        const regex = new RegExp(pattern);
        const folders = workspace.workspaceFolders;

        if (!folders) break;

        if (folders.some((folder) => regex.test(folder.name))) {
            isWorkspaceIgnored = true;
            break;
        }
    }

    const enableCommand = commands.registerCommand(Commands.ENABLE_RPC, async () => {
        await config.update("enabled", true);

        ListenerController.reset();
        await ClientController.login(ctx);

        if (config[CONFIG_KEYS.SuppressNotifications]) await logInfo("Enabled rich presence for this workspace!");
    });

    const disableCommand = commands.registerCommand(Commands.DISABLE_RPC, async () => {
        await config.update("enabled", false);

        ListenerController.reset();
        await ClientController.rpc.destroy();

        if (config[CONFIG_KEYS.SuppressNotifications]) await logInfo("Disabled rich presence for this workspace!");
    });

    const disconnectCommand = commands.registerCommand(Commands.DISCONNECT_RPC, async () => {
        ListenerController.reset();
        await ClientController.rpc.destroy();
    });

    const reconnectCommand = commands.registerCommand(Commands.RECONNECT_RPC, async () => {
        ListenerController.reset();

        await ClientController.rpc.destroy();
        await ClientController.login(ctx);
    });

    const statusCommand = commands.registerCommand(Commands.STATUS_RPC, async () => {
        ListenerController.reset();

        await logInfo(
            `Currently ${ClientController.rpc.isConnected ? "connected" : "not connected"} to Discord Gateway!`
        );
    });

    ctx.subscriptions.push(enableCommand, disableCommand, reconnectCommand, disconnectCommand, statusCommand);

    if (!isWorkspaceIgnored && config[CONFIG_KEYS.Enabled]) await ClientController.login(ctx);
};

export const deactivate = async (ctx: ExtensionContext) => {
    ctx.logger.info("coc-discord-rpc is deactivated!");

    ListenerController.reset();
    await ClientController.rpc.destroy();
};

process.on("unhandledRejection", (error) => void logError(`RPC: ${error}`));
