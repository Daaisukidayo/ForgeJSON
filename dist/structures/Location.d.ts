import type { Context } from "@tryforge/forgescript";
import { Result } from "../functions/result";
export declare class Location {
    private readonly ctx;
    readonly source: string;
    readonly keys: readonly string[];
    constructor(ctx: Context, source: string, keys?: readonly string[]);
    toString(): string;
    read(): Result<unknown>;
    write(value: unknown): Result<void>;
    delete(): Result<boolean>;
    array(): Result<unknown[]>;
    array(options: {
        create: false;
    }): Result<unknown[] | null>;
    record(): Result<Record<string, unknown>>;
    private _readSource;
    private _writable;
}
//# sourceMappingURL=Location.d.ts.map