"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveFileIcon = exports.getGitRepo = exports.getConfig = void 0;
const coc_nvim_1 = require("coc.nvim");
const git_url_parse_1 = __importDefault(require("git-url-parse"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const path_1 = require("path");
const icons_json_1 = __importDefault(require("./icons.json"));
const asyncExec = (0, util_1.promisify)(child_process_1.exec);
function getConfig() {
    return coc_nvim_1.workspace.getConfiguration("rpc");
}
exports.getConfig = getConfig;
async function getGitRepo() {
    try {
        const isInit = await asyncExec("git rev-parse --git-dir");
        if (!isInit.stdout.trim())
            return null;
        const remoteUrl = await asyncExec("git config --get remote.origin.url");
        if (!remoteUrl.stdout)
            return null;
        return (0, git_url_parse_1.default)(remoteUrl.stdout).toString("https").replace(".git", "");
    }
    catch {
        return null;
    }
}
exports.getGitRepo = getGitRepo;
const knownExtensions = icons_json_1.default.knownExtensions;
const knownLanguages = icons_json_1.default.knownLanguages;
function resolveFileIcon(document) {
    const filename = (0, path_1.basename)(document.uri);
    const { languageId } = document.textDocument;
    const icon = knownExtensions[Object.keys(knownExtensions).find((key) => {
        if (filename.endsWith(key))
            return true;
        const match = /^\/(.*)\/([mgiy]+)$/.exec(key);
        if (!match)
            return false;
        const regex = new RegExp(match[1], match[2]);
        return regex.test(filename);
    })] ?? (knownLanguages.includes(languageId) ? languageId : null);
    return icon ? icon.image ?? icon : "text";
}
exports.resolveFileIcon = resolveFileIcon;
