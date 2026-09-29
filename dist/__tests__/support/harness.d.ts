import { ForgeClient } from "@tryforge/forgescript";
import { ForgeJSON } from "../..";
export interface IRun {
    output: string | null;
    errors: string[];
    env: Record<string, unknown>;
}
export declare class TestBot {
    readonly ext: ForgeJSON;
    readonly client: ForgeClient;
    readonly warnings: string[];
    constructor(ext?: ForgeJSON);
    run(code: string, env?: Record<string, unknown>): Promise<IRun>;
}
export declare const bot: TestBot;
export declare function output(code: string, env?: Record<string, unknown>): Promise<string | null>;
export declare function failure(code: string, env?: Record<string, unknown>): Promise<string>;
export declare function json(code: string, env?: Record<string, unknown>): Promise<any>;
//# sourceMappingURL=harness.d.ts.map