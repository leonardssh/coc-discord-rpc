import { Disposable } from 'coc.nvim';
import type { Activity } from './activity';
export declare class Listener implements Disposable {
    private activity;
    private disposables;
    constructor(activity: Activity);
    listen(): void;
    dispose(): void;
}
//# sourceMappingURL=listener.d.ts.map