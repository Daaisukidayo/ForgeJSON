"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const edit_1 = require("../../functions/edit");
const Location_1 = require("../../structures/Location");
const source_1 = require("../../functions/source");
const OBJECT = /^\s*\{/;
function splitSources(rest) {
    let start = rest.length - 1;
    while (start > 0 && OBJECT.test(rest[start - 1]))
        start--;
    return [rest.slice(0, start), rest.slice(start)];
}
exports.default = new forgescript_1.NativeFunction({
    name: "$objectMerge",
    version: "1.0.0",
    description: "Merges objects into another",
    unwrap: true,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredString("variable", "The variable that holds the object"),
        forgescript_1.Arg.restString("keys;sources", "The keys to follow, then the objects to merge in", true),
    ],
    execute(ctx, [variable, rest]) {
        const [keys, sources] = splitSources(rest);
        const incoming = [];
        for (const source of sources) {
            const read = (0, source_1.readRecord)(ctx, source);
            if (!read.ok)
                return this.customError(read.reason);
            incoming.push(read.value);
        }
        const target = new Location_1.Location(ctx, variable, keys).record();
        if (!target.ok)
            return this.customError(target.reason);
        for (const object of incoming)
            (0, edit_1.mergeInto)(target.value, object);
        return this.success();
    },
});
//# sourceMappingURL=objectMerge.js.map