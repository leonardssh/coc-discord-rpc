import { Client, type ClientOptions } from "@xhayper/discord-rpc";
import { FORMAT_FUNCTION_LIST, CONFIG_KEYS } from "./constants";
import type { ExtensionContext } from "coc.nvim";
import { ListenerController } from "./listener";
import { ActivityController } from "./activity";
import { logInfo } from "./logger";
import { getConfig } from "./util";

const config = getConfig();

const clientOptions: ClientOptions = {
    clientId: config[CONFIG_KEYS.ClientId],
    transport: { pathList: FORMAT_FUNCTION_LIST }
};

export class ClientController {
    public static rpc: Client = new Client(clientOptions);

    public static async login(ctx: ExtensionContext) {
        ClientController.rpc = new Client(clientOptions);

        ClientController.rpc.once("ready", () => void ClientController.handleLogin(ctx));
        ClientController.rpc.once("disconnected", () => void ClientController.handleDisconnected(ctx));

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

        if (config[CONFIG_KEYS.SuppressNotifications]) await logInfo("Connected to Discord Gateway!");

        ListenerController.reset();
        await ActivityController.sendActivity();
        ListenerController.listen();
    }

    private static async handleDisconnected(ctx: ExtensionContext) {
        ctx.logger.info("Disconnected from Discord Gateway");

        if (config[CONFIG_KEYS.SuppressNotifications]) await logInfo("Disconnected from Discord Gateway!");

        ListenerController.reset();
        await ClientController.rpc.destroy();
    }
}
