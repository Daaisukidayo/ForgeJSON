"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTemplate = parseTemplate;
exports.fill = fill;
const location_1 = require("./location");
const value_1 = require("./value");
function readPlaceholder(inside) {
    const keys = [];
    let key = "";
    for (let i = 0; i < inside.length; i++) {
        const char = inside[i];
        if (char === "\\" && i + 1 < inside.length)
            key += inside[++i];
        else if (char === ".") {
            keys.push(key);
            key = "";
        }
        else
            key += char;
    }
    keys.push(key);
    if (keys.includes("") || keys.some((one) => location_1.FORBIDDEN_KEYS.has(one)))
        return null;
    return keys;
}
function parseTemplate(template) {
    const parts = [];
    let text = "";
    for (let i = 0; i < template.length; i++) {
        const char = template[i];
        const next = template[i + 1];
        if ((char === "{" && next === "{") || (char === "}" && next === "}")) {
            text += char;
            i++;
            continue;
        }
        const end = char === "{" ? template.indexOf("}", i + 1) : -1;
        const inside = end === -1 ? "" : template.slice(i + 1, end);
        const special = inside === "#" ? { position: true } : inside === "." ? { self: true } : null;
        const keys = special || !inside ? null : readPlaceholder(inside);
        if (!special && !keys) {
            text += char;
            continue;
        }
        if (text)
            parts.push({ text });
        parts.push(special ?? { keys: keys });
        text = "";
        i = end;
    }
    if (text)
        parts.push({ text });
    return parts;
}
function fill(parts, element, position) {
    let out = "";
    for (const part of parts) {
        if ("text" in part)
            out += part.text;
        else if ("position" in part)
            out += position;
        else if ("self" in part)
            out += shown(element);
        else
            out += shown((0, location_1.readIn)(element, part.keys));
    }
    return out;
}
const shown = (value) => (value === null ? "" : ((0, value_1.toText)(value) ?? ""));
//# sourceMappingURL=template.js.map