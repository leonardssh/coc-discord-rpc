import { Disposable, events, workspace } from "coc.nvim";
import { ActivityController } from "./activity";
import { throttle } from "lodash";

export class ListenerController {
    public static disposables: Disposable[] = [];

    public static listen() {
        const onFileSwitch = events.on(
            "BufEnter",
            throttle(() => ActivityController.toggleViewingMode(), 1000)
        );

        const onChangeTextDocument = workspace.onDidChangeTextDocument(
            throttle(() => ActivityController.toggleViewingMode(false), 1000)
        );

        const onOpenTextDocument = workspace.onDidOpenTextDocument(
            throttle(() => ActivityController.toggleViewingMode(), 1000)
        );

        const onInsertEnter = events.on("InsertEnter", () => ActivityController.toggleViewingMode(false));
        const onInsertLeave = events.on("InsertLeave", () => ActivityController.toggleViewingMode());
        const onFocusGained = events.on("FocusGained", () => ActivityController.checkIdle(true));
        const onFocusLost = events.on("FocusLost", () => ActivityController.checkIdle(false));

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

        if (ActivityController.interval) {
            clearTimeout(ActivityController.interval);
        }
    }
}
