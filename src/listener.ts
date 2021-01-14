import { DidChangeTextDocumentParams, Disposable, events, workspace } from 'coc.nvim';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import type { Activity } from './activity';

export class Listener implements Disposable {
	private disposables: Disposable[] = [];

	public constructor(private activity: Activity) {}

	public listen() {
		this.dispose();

		const fileSwitch = events;
		const fileEdit = workspace.onDidChangeTextDocument;
		const fileOpen = workspace.onDidOpenTextDocument;

		const { enabled } = this.activity.client.config;

		if (enabled) {
			const onFileSwitch = fileSwitch.on('BufEnter', (bufnr: number) => this.activity.onFileSwitch(bufnr));
			const onFileEdit = fileEdit(({ bufnr }: DidChangeTextDocumentParams) => this.activity.onFileEdit(bufnr));
			const onFileOpen = fileOpen((e: TextDocument) => this.activity.onFileOpen(e));

			this.disposables.push(onFileSwitch, onFileEdit, onFileOpen);
		}
	}

	public dispose() {
		this.disposables.forEach((disposable: Disposable) => disposable.dispose());
	}
}
