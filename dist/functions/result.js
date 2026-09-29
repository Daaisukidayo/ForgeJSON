"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fail = exports.ok = void 0;
const ok = (value) => ({ ok: true, value });
exports.ok = ok;
const fail = (reason) => ({ ok: false, reason });
exports.fail = fail;
//# sourceMappingURL=result.js.map