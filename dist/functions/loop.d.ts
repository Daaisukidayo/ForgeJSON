import type { CompiledFunction, Context, IExtendedCompiledFunctionConditionField, Return } from "@tryforge/forgescript";
import { Result } from "./result";
export declare function readLoopVariables(element: string, index: string | null): Result<[string, string | null]>;
export declare function borrow(ctx: Context, names: readonly (string | null)[]): () => void;
export declare function isTrue(run: Return): boolean;
export declare function eachElement(fn: CompiledFunction, ctx: Context, [source, variable, index]: [string, string, string | null], step: (item: unknown, index: number) => Promise<Return | true | void>, fromEnd?: boolean): Promise<Return | null>;
export declare function testEach(fn: CompiledFunction, ctx: Context, names: [string, string, string | null], condition: IExtendedCompiledFunctionConditionField, visit: (item: unknown, index: number) => boolean | void, { fromEnd, when }?: {
    fromEnd?: boolean;
    when?: boolean;
}): Promise<Return | null>;
//# sourceMappingURL=loop.d.ts.map