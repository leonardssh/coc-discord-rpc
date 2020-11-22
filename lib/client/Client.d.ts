import { Disposable, ExtensionContext, WorkspaceConfiguration } from 'coc.nvim';
export default class Client implements Disposable {
    config: WorkspaceConfiguration;
    private rpc?;
    private readonly activity;
    constructor(config: WorkspaceConfiguration);
    connect(ctx?: ExtensionContext, _log?: boolean): Promise<void>;
    ready(ctx?: ExtensionContext, _log?: boolean): void;
    setActivity(): Promise<void>;
    dispose(): Promise<void>;
    disconnect(): Promise<void>;
    private registerCommands;
    private isWorkspaceIgnored;
}
//# sourceMappingURL=Client.d.ts.map