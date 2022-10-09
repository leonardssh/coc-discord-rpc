"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FORMAT_FUNCTION_LIST = exports.ACCEPTED_DIAGNOSTIC_SEVERITY = exports.SEND_ACTIVITY_TIMEOUT = exports.VIM_IDLE_IMAGE_KEY = exports.VIM_IMAGE_KEY = exports.NEOVIM_IDLE_IMAGE_KEY = exports.NEOVIM_IMAGE_KEY = exports.IDLE_IMAGE_KEY = exports.FAKE_EMPTY = exports.EMPTY = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
exports.EMPTY = "";
exports.FAKE_EMPTY = "\u200b\u200b";
exports.IDLE_IMAGE_KEY = "idle";
exports.NEOVIM_IMAGE_KEY = "neovim-logo";
exports.NEOVIM_IDLE_IMAGE_KEY = "idle-neovim";
exports.VIM_IMAGE_KEY = "vim";
exports.VIM_IDLE_IMAGE_KEY = "vim";
exports.SEND_ACTIVITY_TIMEOUT = 5000;
exports.ACCEPTED_DIAGNOSTIC_SEVERITY = ["Warning", "Error"];
const NVIM_ANNOYING_PREFIX = ["nvim", "vim"];
const CUT_PREFIX_UNTIL_ANNOYING_NVIM = (fullpath) => {
    let prefix = "";
    for (const p of fullpath.split(path_1.default.sep)) {
        if (NVIM_ANNOYING_PREFIX.some((pp) => p.startsWith(pp)))
            break;
        prefix += `${p}${path_1.default.sep}`;
    }
    return prefix;
};
exports.FORMAT_FUNCTION_LIST = [
    (id) => {
        // Windows path
        const isWindows = process.platform === "win32";
        return [isWindows ? `\\\\?\\pipe\\discord-ipc-${id}` : "", isWindows];
    },
    (id) => {
        // macOS/Linux path
        if (process.platform === "win32")
            return [""];
        const { env: { XDG_RUNTIME_DIR, TMPDIR, TMP, TEMP } } = process;
        const prefix = CUT_PREFIX_UNTIL_ANNOYING_NVIM(fs_1.default.realpathSync(XDG_RUNTIME_DIR ?? TMPDIR ?? TMP ?? TEMP ?? `${path_1.default.sep}tmp`));
        return [path_1.default.join(prefix, `discord-ipc-${id}`)];
    },
    (id) => {
        // snapstore
        if (process.platform === "win32")
            return [""];
        const { env: { XDG_RUNTIME_DIR, TMPDIR, TMP, TEMP } } = process;
        const prefix = CUT_PREFIX_UNTIL_ANNOYING_NVIM(fs_1.default.realpathSync(XDG_RUNTIME_DIR ?? TMPDIR ?? TMP ?? TEMP ?? `${path_1.default.sep}tmp`));
        return [path_1.default.join(prefix, "snap.discord", `discord-ipc-${id}`)];
    },
    (id) => {
        // flatpak
        if (process.platform === "win32")
            return [""];
        const { env: { XDG_RUNTIME_DIR, TMPDIR, TMP, TEMP } } = process;
        const prefix = CUT_PREFIX_UNTIL_ANNOYING_NVIM(fs_1.default.realpathSync(XDG_RUNTIME_DIR ?? TMPDIR ?? TMP ?? TEMP ?? `${path_1.default.sep}tmp`));
        return [path_1.default.join(prefix, "app", "com.discordapp.Discord", `discord-ipc-${id}`)];
    }
];
