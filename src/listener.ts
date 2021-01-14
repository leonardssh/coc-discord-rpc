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
		const fileWrite = events;

		const { enabled } = this.activity.client.config;

		if (enabled) {
			const onFileSwitch = fileSwitch.on('BufEnter', (bufnr: number) => this.activity.onFileSwitch(bufnr));
			const onFileEdit = fileEdit(({ bufnr }: DidChangeTextDocumentParams) => this.activity.onFileEdit(bufnr));
			const onFileOpen = fileOpen((e: TextDocument) => this.activity.onFileOpen(e));
			const onFileWrite = fileWrite.on('BufWritePost', (bufnr: number) => this.activity.onFileWrite(bufnr));

			this.disposables.push(onFileSwitch, onFileEdit, onFileOpen, onFileWrite);
		}
	}

	public dispose() {
		this.disposables.forEach((disposable: Disposable) => disposable.dispose());
	}
}
