import { Disposable, WorkspaceConfiguration } from 'coc.nvim';
export default class Client implements Disposable {
    config: WorkspaceConfiguration;
    private rpc?;
    private readonly activity;
    constructor(config: WorkspaceConfiguration);
    connect(): Promise<void>;
    ready(): void;
    setActivity(workspaceElapsedTime?: boolean): Promise<void>;
    dispose(): Promise<void>;
    disconnect(): Promise<void>;
}
//# sourceMappingURL=Client.d.ts.map