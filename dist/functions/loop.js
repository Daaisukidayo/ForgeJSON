"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readLoopVariables = readLoopVariables;
exports.borrow = borrow;
exports.isTrue = isTrue;
exports.eachElement = eachElement;
exports.testEach = testEach;
const location_1 = require("./location");
const result_1 = require("./result");
const source_1 = require("./source");
function readLoopVariables(element, index) {
    if (!element)
        return (0, result_1.fail)("The loop needs a variable to load every element to.");
    const names = (0, location_1.checkKeys)(index ? [element, index] : [element]);
    if (!names.ok)
        return names;
    return (0, result_1.ok)([element, index || null]);
}
function borrow(ctx, names) {
    const held = names.filter((name) => !!name).map((name) => [name, (0, location_1.readVariable)(ctx, name)]);
    return () => {
        for (const [name, value] of held) {
            if (value === undefined)
                ctx.deleteEnvironmentKey(name);
            else
                ctx.setEnvironmentKey(name, value);
        }
    };
}
function isTrue(run) {
    return run.value === true || run.value === "true";
}
async function eachElement(fn, ctx, [source, variable, index], step, fromEnd = false) {
    const list = (0, source_1.readArray)(ctx, source);
    if (!list.ok)
        return fn.customError(list.reason);
    const names = readLoopVariables(variable, index);
    if (!names.ok)
        return fn.customError(names.reason);
    const [element, position] = names.value;
    const giveBack = borrow(ctx, names.value);
    const count = list.value.length;
    try {
        for (let n = 0; n < count; n++) {
            const i = fromEnd ? count - 1 - n : n;
            ctx.setEnvironmentKey(element, list.value[i]);
            if (position)
                ctx.setEnvironmentKey(position, i);
            const stop = await step(list.value[i], i);
            if (stop === true)
                break;
            if (stop)
                return stop;
        }
    }
    finally {
        giveBack();
    }
    return null;
}
function testEach(fn, ctx, names, condition, visit, { fromEnd = false, when = true } = {}) {
    return eachElement(fn, ctx, names, async (item, i) => {
        const run = await fn["resolveCondition"](ctx, condition);
        if (!run.success && !run.return)
            return run;
        if (isTrue(run) === when && visit(item, i))
            return true;
    }, fromEnd);
}
//# sourceMappingURL=loop.js.map