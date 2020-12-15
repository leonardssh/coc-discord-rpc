import { Disposable, WorkspaceConfiguration } from 'coc.nvim';
export default class Client implements Disposable {
    config: WorkspaceConfiguration;
    private rpc?;
    private ready;
    private readonly activity;
    constructor(config: WorkspaceConfiguration);
    connect(): Promise<void>;
    handleReady(): void;
    setActivity(workspaceElapsedTime?: boolean): Promise<void>;
    dispose(): void;
    disconnect(): void;
}
//# sourceMappingURL=Client.d.ts.map