"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = exports.LogLevel = void 0;
const coc_nvim_1 = require("coc.nvim");
var LogLevel;
(function (LogLevel) {
    LogLevel["Info"] = "more";
    LogLevel["Warn"] = "warning";
    LogLevel["Err"] = "error";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
exports.log = (logMsg, logLevel) => coc_nvim_1.workspace.showMessage(`RPC: ${logMsg}`, logLevel);
//# sourceMappingURL=Logger.js.map