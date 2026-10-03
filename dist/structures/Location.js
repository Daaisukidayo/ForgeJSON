"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Location = void 0;
const location_1 = require("../functions/location");
const result_1 = require("../functions/result");
const value_1 = require("../functions/value");
function spell(source, keys) {
    return [(0, value_1.looksLikeJSON)(source) ? (0, value_1.shorten)(source) : source, ...keys].join(";");
}
class Location {
    ctx;
    source;
    keys;
    constructor(ctx, source, keys = []) {
        this.ctx = ctx;
        this.source = source;
        this.keys = keys;
    }
    toString() {
        return spell(this.source, this.keys);
    }
    read() {
        const checked = (0, location_1.checkKeys)(this.keys);
        if (!checked.ok)
            return checked;
        const whole = this._readSource();
        if (!whole.ok)
            return whole;
        return (0, result_1.ok)((0, location_1.readIn)(whole.value, this.keys));
    }
    write(value) {
        const checked = this._writable();
        if (!checked.ok)
            return checked;
        const { ctx, source: variable, keys } = this;
        if (!keys.length) {
            ctx.setEnvironmentKey(variable, value);
            return (0, result_1.ok)(undefined);
        }
        let node = (0, location_1.readVariable)(ctx, variable);
        if (node === undefined || node === null) {
            node = {};
            ctx.setEnvironmentKey(variable, node);
        }
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const at = spell(variable, keys.slice(0, i));
            if (!(0, location_1.isContainer)(node))
                return (0, result_1.fail)(`"${at}" is ${(0, value_1.describe)(node)}, it has no key "${key}".`);
            const container = node;
            let slot = key;
            if (Array.isArray(node)) {
                const index = (0, location_1.slotIn)(node, key, at);
                if (!index.ok)
                    return index;
                slot = index.value;
            }
            if (i === keys.length - 1) {
                container[slot] = value;
                return (0, result_1.ok)(undefined);
            }
            let child = Array.isArray(node) || Object.hasOwn(container, slot) ? container[slot] : undefined;
            if (child === undefined || child === null) {
                child = {};
                container[slot] = child;
            }
            node = child;
        }
        return (0, result_1.ok)(undefined);
    }
    delete() {
        const checked = this._writable();
        if (!checked.ok)
            return checked;
        const { ctx, source: variable, keys } = this;
        if (!keys.length) {
            const had = (0, location_1.readVariable)(ctx, variable) !== undefined;
            ctx.deleteEnvironmentKey(variable);
            return (0, result_1.ok)(had);
        }
        const parent = (0, location_1.readIn)((0, location_1.readVariable)(ctx, variable), keys.slice(0, -1));
        const key = keys[keys.length - 1];
        if (Array.isArray(parent)) {
            const index = (0, location_1.indexIn)(parent, key);
            if (index < 0 || index >= parent.length)
                return (0, result_1.ok)(false);
            parent.splice(index, 1);
            return (0, result_1.ok)(true);
        }
        if (!(0, location_1.isRecord)(parent) || !Object.hasOwn(parent, key))
            return (0, result_1.ok)(false);
        return (0, result_1.ok)(delete parent[key]);
    }
    array({ create = true } = {}) {
        const checked = this._writable();
        if (!checked.ok)
            return checked;
        const read = this.read();
        if (!read.ok)
            return read;
        if (Array.isArray(read.value))
            return (0, result_1.ok)(read.value);
        if (read.value !== undefined && read.value !== null) {
            return (0, result_1.fail)(`"${this}" is ${(0, value_1.describe)(read.value)}, not an array.`);
        }
        if (!create)
            return (0, result_1.ok)(null);
        const created = [];
        const written = this.write(created);
        return written.ok ? (0, result_1.ok)(created) : written;
    }
    record() {
        const checked = this._writable();
        if (!checked.ok)
            return checked;
        const read = this.read();
        if (!read.ok)
            return read;
        if ((0, location_1.isRecord)(read.value))
            return (0, result_1.ok)(read.value);
        if (read.value !== undefined && read.value !== null) {
            return (0, result_1.fail)(`"${this}" is ${(0, value_1.describe)(read.value)}, not an object.`);
        }
        const created = {};
        const written = this.write(created);
        return written.ok ? (0, result_1.ok)(created) : written;
    }
    _readSource() {
        if ((0, value_1.looksLikeJSON)(this.source))
            return (0, value_1.readJSON)(this.source);
        const name = (0, location_1.checkKeys)([this.source]);
        if (!name.ok)
            return name;
        return (0, result_1.ok)((0, location_1.readVariable)(this.ctx, this.source));
    }
    _writable() {
        if ((0, value_1.looksLikeJSON)(this.source))
            return (0, result_1.fail)(`"${(0, value_1.shorten)(this.source)}" is JSON, only a variable can be written to.`);
        return (0, location_1.checkKeys)([this.source, ...this.keys]);
    }
}
exports.Location = Location;
//# sourceMappingURL=Location.js.map