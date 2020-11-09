import { Disposable, ExtensionContext, WorkspaceConfiguration } from 'coc.nvim';
export default class Client implements Disposable {
    config: WorkspaceConfiguration;
    private rpc?;
    private readonly activity;
    constructor(config: WorkspaceConfiguration);
    connect(ctx?: ExtensionContext): Promise<void>;
    ready(ctx?: ExtensionContext): void;
    setActivity(): Promise<void>;
    dispose(): Promise<void>;
    disconnect(): Promise<void>;
    private registerCommands;
}
//# sourceMappingURL=Client.d.ts.map