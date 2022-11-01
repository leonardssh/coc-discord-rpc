import { Disposable, events, workspace } from "coc.nvim";
import { ActivityController } from "./activity";
import { throttle } from "./throttle";

export class ListenerController {
    public static disposables: Disposable[] = [];

    public static listen() {
        const onFileSwitch = events.on(
            "BufEnter",
            throttle(() => void ActivityController.toggleViewingMode(), 1000).callable
        );

        const onChangeTextDocument = workspace.onDidChangeTextDocument(
            throttle(() => void ActivityController.toggleViewingMode(false), 1000).callable
        );

        const onOpenTextDocument = workspace.onDidOpenTextDocument(
            throttle(() => void ActivityController.toggleViewingMode(), 1000).callable
        );

        const onInsertEnter = events.on("InsertEnter", () => void ActivityController.toggleViewingMode(false));
        const onInsertLeave = events.on("InsertLeave", () => void ActivityController.toggleViewingMode());
        const onFocusGained = events.on("FocusGained", () => void ActivityController.checkIdle(true));
        const onFocusLost = events.on("FocusLost", () => void ActivityController.checkIdle(false));

        ListenerController.disposables.push(
            onFileSwitch,
            onChangeTextDocument,
            onOpenTextDocument,
            onInsertEnter,
            onInsertLeave,
            onFocusGained,
            onFocusLost
        );
    }

    public static reset() {
        ListenerController.disposables.forEach((disposable: Disposable) => disposable.dispose());
        ListenerController.disposables = [];

        if (ActivityController.interval) clearTimeout(ActivityController.interval);
        ActivityController.interval = undefined;
    }
}
