import type { Disposable, ExtensionContext, WorkspaceConfiguration } from 'coc.nvim';
import { Presence } from 'discord-rpc';
export declare class Client implements Disposable {
    config: WorkspaceConfiguration;
    private rpc?;
    private ready?;
    private activity;
    private listener;
    constructor(config: WorkspaceConfiguration);
    connect(ctx: ExtensionContext): Promise<void>;
    handleTransport(): Promise<void>;
    handleReady(ctx: ExtensionContext): Promise<void>;
    setActivity(presence: Presence): Promise<void>;
    dispose(): Promise<void>;
}
declare module 'discord-rpc' {
    interface Client {
        transport: {
            once(event: 'close', listener: () => void): void;
        };
    }
}
//# sourceMappingURL=client.d.ts.map