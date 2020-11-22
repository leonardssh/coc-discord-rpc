import type { Presence } from 'discord-rpc';
import type RPClient from '../client/Client';
import { Disposable } from 'coc.nvim';
export default class Activity implements Disposable {
    private readonly client;
    private _state;
    constructor(client: RPClient);
    generate(): Promise<Presence>;
    dispose(): void;
    private _generateDetails;
    private _generateFileDetails;
}
//# sourceMappingURL=Activity.d.ts.map