import { Disposable } from 'coc.nvim';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import type { Client } from './client';
export declare class Activity implements Disposable {
    client: Client;
    private presence;
    private viewing;
    constructor(client: Client);
    init(): Promise<void>;
    onFileSwitch(bufnr: number | string): Promise<void>;
    onFileEdit(bufnr: number): Promise<void>;
    onFileOpen(document: TextDocument): Promise<void>;
    dispose(): void;
    private generateDetails;
    private generateFileDetails;
    private update;
}
//# sourceMappingURL=activity.d.ts.map