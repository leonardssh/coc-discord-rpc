import type RPClient from '../client/Client';
import { Disposable } from 'coc.nvim';
interface State {
    details?: string;
    state?: string;
    startTimestamp?: number | null;
    largeImageKey?: string;
    largeImageText?: string;
    smallImageKey?: string;
    smallImageText?: string;
}
export default class Activity implements Disposable {
    private readonly client;
    private _state;
    constructor(client: RPClient);
    generate(workspaceElapsedTime?: boolean): Promise<State>;
    dispose(): void;
    private _generateDetails;
    private _generateFileDetails;
}
export {};
//# sourceMappingURL=Activity.d.ts.map