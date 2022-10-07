import type { ExtensionContext } from "coc.nvim";
import { ListenerController } from "./listener";
import { ActivityController } from "./activity";
import { Client } from "@xhayper/discord-rpc";
import { CONFIG_KEYS } from "./constants";
import { logInfo } from "./logger";
import { getConfig } from "./util";

const config = getConfig();

export class ClientController {
    public static rpc: Client = new Client({ clientId: config[CONFIG_KEYS.ClientId] });

    public static async login(ctx: ExtensionContext) {
        ClientController.rpc = new Client({ clientId: config[CONFIG_KEYS.ClientId] });

        ClientController.rpc.once("ready", () => ClientController.handleLogin(ctx));
        ClientController.rpc.once("disconnected", () => ClientController.handleDisconnected(ctx));

        try {
            await ClientController.rpc.login();
        } catch (error) {
            ctx.logger.error(error);

            ListenerController.reset();
            await ClientController.rpc.destroy();
        }
    }

    private static async handleLogin(ctx: ExtensionContext) {
        ctx.logger.info("Connected to Discord Gateway");

        if (config[CONFIG_KEYS.SuppressNotifications]) {
            await logInfo("Connected to Discord Gateway!");
        }

        ListenerController.reset();
        await ActivityController.sendActivity();
        ListenerController.listen();
    }

    private static async handleDisconnected(ctx: ExtensionContext) {
        ctx.logger.info("Disconnected from Discord Gateway");

        if (config[CONFIG_KEYS.SuppressNotifications]) {
            await logInfo("Disconnected from Discord Gateway!");
        }

        ListenerController.reset();
        await ClientController.rpc.destroy();
    }
}
