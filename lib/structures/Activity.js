"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActivity = void 0;
const coc_nvim_1 = require("coc.nvim");
const languages_json_1 = __importDefault(require("../language/languages.json"));
const knownExtensions = languages_json_1.default.knownExtensions;
exports.getActivity = (startTimestamp, workspace, fileName) => {
    let state = {
        details: 'Idling',
        state: 'Idling',
        smallImageKey: 'neovim-logo',
        smallImageText: 'NeoVim',
        largeImageKey: 'neovim-logo',
        largeImageText: 'NeoVim'
    };
    if (!workspace || !fileName) {
        return state;
    }
    let largeImageKey = 'neovim-logo';
    // https://github.com/iCrawl/discord-vscode/blob/master/src/structures/Activity.ts#L80
    largeImageKey =
        knownExtensions[Object.keys(knownExtensions).find((key) => {
            if (fileName.endsWith(key)) {
                return true;
            }
            const match = /^\/(.*)\/([mgiy]+)$/.exec(key);
            if (!match) {
                return false;
            }
            const regex = new RegExp(match[1], match[2]);
            return regex.test(fileName);
        })];
    const coc_explorer = coc_nvim_1.extensions.isActivated('coc-explorer') && '%5Bcoc-explorer%5D-1'.includes(fileName);
    state = {
        ...state,
        details: `Workspace: ${workspace}`,
        state: coc_explorer ? `In explorer` : `Editing ${fileName}`,
        startTimestamp,
        largeImageKey: largeImageKey ? largeImageKey.image || largeImageKey : 'neovim-logo',
        largeImageText: coc_explorer
            ? 'In explorer'
            : `Editing a ${largeImageKey ? (largeImageKey.image || largeImageKey).toUpperCase() : 'TXT'} file`
    };
    return state;
};
//# sourceMappingURL=Activity.js.map