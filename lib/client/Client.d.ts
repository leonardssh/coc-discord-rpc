import { Disposable, ExtensionContext } from 'coc.nvim';
import { Client as RPClient } from 'discord-rpc';
export default class Client implements Disposable {
    private readonly clientId;
    private rpc?;
    constructor(clientId: string);
    get client(): RPClient | undefined;
    connect(ctx?: ExtensionContext): Promise<void>;
    ready(ctx?: ExtensionContext): void;
    setActivity(): void;
    dispose(): Promise<void>;
    disconnect(): Promise<void>;
    private registerCommands;
}
//# sourceMappingURL=Client.d.ts.map