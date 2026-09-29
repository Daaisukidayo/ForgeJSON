import type { CompiledFunction, Context } from "@tryforge/forgescript";
import { Result } from "./result";
type Answerer = Pick<CompiledFunction, "success" | "customError">;
export declare function readArray(ctx: Context, source: string): Result<unknown[]>;
export declare function readRecord(ctx: Context, source: string): Result<Record<string, unknown>>;
export declare function label(source: string): string;
export declare function answer(fn: Pick<CompiledFunction, "success">, value: unknown): import("@tryforge/forgescript").Return<import("@tryforge/forgescript").ReturnType.Success>;
export declare function store(fn: Answerer, ctx: Context, variable: string | null, value: unknown): import("@tryforge/forgescript").Return<import("@tryforge/forgescript").ReturnType.Success> | import("@tryforge/forgescript").Return<import("@tryforge/forgescript").ReturnType.Error>;
export {};
//# sourceMappingURL=source.d.ts.map