import { ForgeExtension } from "@tryforge/forgescript"
import { description, version } from "../package.json"
import path from "path"

export class ForgeJSON extends ForgeExtension {
    name = "ForgeJSON"
    description = description
    version = version

    public init() {
        this.load(path.resolve(__dirname, "native"))
    }
}
