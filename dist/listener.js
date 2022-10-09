"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListenerController = void 0;
const coc_nvim_1 = require("coc.nvim");
const activity_1 = require("./activity");
const lodash_1 = require("lodash");
class ListenerController {
    static disposables = [];
    static listen() {
        const onFileSwitch = coc_nvim_1.events.on("BufEnter", (0, lodash_1.throttle)(() => activity_1.ActivityController.toggleViewingMode(), 1000));
        const onChangeTextDocument = coc_nvim_1.workspace.onDidChangeTextDocument((0, lodash_1.throttle)(() => activity_1.ActivityController.toggleViewingMode(false), 1000));
        const onOpenTextDocument = coc_nvim_1.workspace.onDidOpenTextDocument((0, lodash_1.throttle)(() => activity_1.ActivityController.toggleViewingMode(), 1000));
        const onInsertEnter = coc_nvim_1.events.on("InsertEnter", () => activity_1.ActivityController.toggleViewingMode(false));
        const onInsertLeave = coc_nvim_1.events.on("InsertLeave", () => activity_1.ActivityController.toggleViewingMode());
        const onFocusGained = coc_nvim_1.events.on("FocusGained", () => activity_1.ActivityController.checkIdle(true));
        const onFocusLost = coc_nvim_1.events.on("FocusLost", () => activity_1.ActivityController.checkIdle(false));
        ListenerController.disposables.push(onFileSwitch, onChangeTextDocument, onOpenTextDocument, onInsertEnter, onInsertLeave, onFocusGained, onFocusLost);
    }
    static reset() {
        ListenerController.disposables.forEach((disposable) => disposable.dispose());
        ListenerController.disposables = [];
        if (activity_1.ActivityController.interval)
            clearTimeout(activity_1.ActivityController.interval);
    }
}
exports.ListenerController = ListenerController;
