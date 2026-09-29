"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgeJSON = void 0;
const forgescript_1 = require("@tryforge/forgescript");
const package_json_1 = require("../package.json");
const path_1 = __importDefault(require("path"));
class ForgeJSON extends forgescript_1.ForgeExtension {
    name = "ForgeJSON";
    description = package_json_1.description;
    version = package_json_1.version;
    init() {
        this.load(path_1.default.resolve(__dirname, "native"));
    }
}
exports.ForgeJSON = ForgeJSON;
//# sourceMappingURL=index.js.map