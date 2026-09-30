"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const Location_1 = require("../../structures/Location");
const source_1 = require("../../functions/source");
const value_1 = require("../../functions/value");
exports.default = new forgescript_1.NativeFunction({
    name: "$arraySplice",
    version: "1.1.0",
    description: "Removes elements from an array and inserts new ones, returns the removed elements",
    unwrap: true,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredString("variable", "The variable that holds the array"),
        forgescript_1.Arg.requiredNumber("index", "The index to start at"),
        forgescript_1.Arg.requiredNumber("delete count", "The number of elements to remove"),
        forgescript_1.Arg.restString("elements", "The elements to insert"),
    ],
    output: forgescript_1.ArgType.Json,
    execute(ctx, [variable, index, count, elements]) {
        const list = new Location_1.Location(ctx, variable).array();
        if (!list.ok)
            return this.customError(list.reason);
        return (0, source_1.answer)(this, list.value.splice(index, count, ...elements.map(value_1.parseValue)));
    },
});
//# sourceMappingURL=arraySplice.js.map