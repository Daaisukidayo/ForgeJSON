"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shuffle = shuffle;
function shuffle(items, count = items.length) {
    const out = [...items];
    const take = Math.min(Math.max(count, 0), out.length);
    for (let i = 0; i < take; i++) {
        const j = i + Math.floor(Math.random() * (out.length - i));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out.slice(0, take);
}
//# sourceMappingURL=random.js.map