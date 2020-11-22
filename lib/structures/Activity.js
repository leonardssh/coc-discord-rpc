"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const coc_nvim_1 = require("coc.nvim");
const languages_json_1 = __importDefault(require("../language/languages.json"));
const knownExtensions = languages_json_1.default.knownExtensions;
const knownLanguages = languages_json_1.default.knownLanguages;
const empty = '\u200b\u200b';
class Activity {
    constructor(client) {
        Object.defineProperty(this, "client", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: client
        });
        Object.defineProperty(this, "_state", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    async generate() {
        var _a, _b, _c;
        let largeImageKey = 'neovim-logo';
        const workspaceName = coc_nvim_1.workspace.root.split('/').pop();
        const fileName = (_a = coc_nvim_1.workspace.getDocument(coc_nvim_1.workspace.uri)) === null || _a === void 0 ? void 0 : _a.uri.split('/').pop();
        if (workspaceName && fileName) {
            const coc_explorer = coc_nvim_1.extensions.isActivated('coc-explorer') && fileName.endsWith('%5Bcoc-explorer%5D-1');
            if (coc_explorer) {
                this._state = {
                    ...this._state,
                    details: await this._generateDetails('detailsInExplorer', 'detailsIdleInExplorer', largeImageKey),
                    state: await this._generateDetails('lowerDetailsInExplorer', 'lowerDetailsIdleInExplorer', largeImageKey),
                    largeImageKey,
                    largeImageText: this.client.config.get('largeImageInExplorer')
                };
                return this._state;
            }
            // https://github.com/iCrawl/discord-vscode/blob/master/src/structures/Activity.ts#L80
            largeImageKey = (_b = knownExtensions[Object.keys(knownExtensions).find((key) => {
                if (fileName.endsWith(key)) {
                    return true;
                }
                const match = /^\/(.*)\/([mgiy]+)$/.exec(key);
                if (!match) {
                    return false;
                }
                const regex = new RegExp(match[1], match[2]);
                return regex.test(fileName);
            })]) !== null && _b !== void 0 ? _b : (knownLanguages.includes((await coc_nvim_1.workspace.getCurrentState()).document.languageId)
                ? (await coc_nvim_1.workspace.getCurrentState()).document.languageId
                : null);
        }
        let previousTimestamp = undefined;
        if ((_c = this._state) === null || _c === void 0 ? void 0 : _c.startTimestamp) {
            previousTimestamp = this._state.startTimestamp;
        }
        const languageId = (await coc_nvim_1.workspace.getCurrentState()).document.languageId.padEnd(2, '\u200b');
        this._state = {
            ...this._state,
            startTimestamp: workspaceName && fileName && previousTimestamp
                ? previousTimestamp
                : workspaceName && fileName
                    ? new Date().getTime()
                    : undefined,
            details: await this._generateDetails('detailsEditing', 'detailsIdle', largeImageKey),
            state: await this._generateDetails('lowerDetailsEditing', 'lowerDetailsIdle', largeImageKey),
            smallImageKey: 'neovim-logo',
            smallImageText: this.client.config.get('smallImage').replace('{appname}', 'NeoVim'),
            largeImageKey: largeImageKey ? largeImageKey.image || largeImageKey : 'text',
            largeImageText: workspaceName && fileName
                ? this.client.config
                    .get('largeImage')
                    .replace('{lang}', largeImageKey ? largeImageKey.image || largeImageKey : 'txt')
                    .replace('{Lang}', largeImageKey
                    ? (largeImageKey.image || largeImageKey)
                        .toLowerCase()
                        .replace(/^\w/, (c) => c.toUpperCase())
                    : 'Txt')
                    .replace('{LANG}', largeImageKey ? (largeImageKey.image || largeImageKey).toUpperCase() : 'TXT') || languageId
                : this.client.config.get('largeImageIdle')
        };
        return this._state;
    }
    dispose() {
        this._state = undefined;
    }
    async _generateDetails(editing, idling, largeImageKey) {
        var _a;
        let raw = this.client.config.get(idling).replace('{null}', empty);
        const filename = (_a = coc_nvim_1.workspace.getDocument(coc_nvim_1.workspace.uri)) === null || _a === void 0 ? void 0 : _a.uri.split('/').pop();
        const workspaceFolder = coc_nvim_1.workspace.root.split('/').pop();
        if (!workspaceFolder || !filename) {
            return raw;
        }
        raw = this.client.config.get(editing);
        const { totalLines, currentLine, currentColumn } = await this._generateFileDetails(raw);
        const problemsCount = coc_nvim_1.diagnosticManager.getDiagnostics(coc_nvim_1.workspace.uri).length;
        const problems = this.client.config.get('showProblems')
            ? this.client.config.get('problemsText').replace('{count}', problemsCount.toString())
            : '';
        raw = raw
            .replace('{null}', empty)
            .replace('{filename}', filename)
            .replace('{workspace}', workspaceFolder)
            .replace('{lang}', largeImageKey ? largeImageKey.image || largeImageKey : 'txt')
            .replace('{Lang}', largeImageKey
            ? (largeImageKey.image || largeImageKey)
                .toLowerCase()
                .replace(/^\w/, (c) => c.toUpperCase())
            : 'Txt')
            .replace('{LANG}', largeImageKey ? (largeImageKey.image || largeImageKey).toUpperCase() : 'TXT')
            .replace('{problems}', problems);
        if (totalLines) {
            raw = raw.replace('{totallines}', totalLines);
        }
        if (currentLine) {
            raw = raw.replace('{currentline}', currentLine);
        }
        if (currentColumn) {
            raw = raw.replace('{currentcolumn}', currentColumn);
        }
        return raw;
    }
    async _generateFileDetails(raw) {
        var _a;
        const fileDetail = {};
        if (!raw) {
            return fileDetail;
        }
        if ((_a = coc_nvim_1.workspace.getDocument(coc_nvim_1.workspace.uri)) === null || _a === void 0 ? void 0 : _a.uri.split('/').pop()) {
            if (raw.includes('{totallines}')) {
                fileDetail.totalLines = coc_nvim_1.workspace.getDocument(coc_nvim_1.workspace.uri).lineCount.toLocaleString();
            }
            if (raw.includes('{currentline}')) {
                fileDetail.currentLine = ((await coc_nvim_1.workspace.getCursorPosition()).line + 1).toLocaleString();
            }
            if (raw.includes('{currentcolumn}')) {
                fileDetail.currentColumn = ((await coc_nvim_1.workspace.getCursorPosition()).character + 1).toLocaleString();
            }
        }
        return fileDetail;
    }
}
exports.default = Activity;
//# sourceMappingURL=Activity.js.map