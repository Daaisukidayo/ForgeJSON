import type { Context } from "@tryforge/forgescript";
import { Result } from "./result";
export declare const FORBIDDEN_KEYS: ReadonlySet<string>;
export declare function isContainer(value: unknown): value is object;
export declare function isRecord(value: unknown): value is Record<string, unknown>;
export declare function checkKeys(keys: readonly string[]): Result<readonly string[]>;
export declare function splitLast(rest: readonly string[]): [string[], string];
export declare function indexIn(array: readonly unknown[], key: string): number;
export declare function childOf(value: unknown, key: string): unknown;
export declare function readIn(value: unknown, keys: readonly string[]): unknown;
export declare function readVariable(ctx: Context, name: string): unknown;
export declare function slotIn(array: unknown[], key: string, at: string): Result<number>;
//# sourceMappingURL=location.d.ts.map