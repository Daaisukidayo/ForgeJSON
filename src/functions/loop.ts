import type { CompiledFunction, Context, IExtendedCompiledFunctionConditionField, Return } from "@tryforge/forgescript"
import { checkKeys, readVariable } from "./location"
import { fail, ok, Result } from "./result"
import { readArray } from "./source"

export function readLoopVariables(element: string, index: string | null): Result<[string, string | null]> {
    if (!element) return fail("The loop needs a variable to load every element to.")

    const names = checkKeys(index ? [element, index] : [element])
    if (!names.ok) return names

    return ok([element, index || null])
}

export function borrow(ctx: Context, names: readonly (string | null)[]) {
    const held = names.filter((name): name is string => !!name).map((name) => [name, readVariable(ctx, name)] as const)

    return () => {
        for (const [name, value] of held) {
            if (value === undefined) ctx.deleteEnvironmentKey(name)
            else ctx.setEnvironmentKey(name, value)
        }
    }
}

export function isTrue(run: Return) {
    return run.value === true || run.value === "true"
}

export async function eachElement(
    fn: CompiledFunction,
    ctx: Context,
    [source, variable, index]: [string, string, string | null],
    step: (item: unknown, index: number) => Promise<Return | true | void>,
    fromEnd = false
): Promise<Return | null> {
    const list = readArray(ctx, source)
    if (!list.ok) return fn.customError(list.reason)

    const names = readLoopVariables(variable, index)
    if (!names.ok) return fn.customError(names.reason)

    const [element, position] = names.value
    const giveBack = borrow(ctx, names.value)
    const count = list.value.length

    try {
        for (let n = 0; n < count; n++) {
            const i = fromEnd ? count - 1 - n : n

            ctx.setEnvironmentKey(element, list.value[i])
            if (position) ctx.setEnvironmentKey(position, i)

            const stop = await step(list.value[i], i)
            if (stop === true) break
            if (stop) return stop
        }
    } finally {
        giveBack()
    }

    return null
}

export function testEach(
    fn: CompiledFunction,
    ctx: Context,
    names: [string, string, string | null],
    condition: IExtendedCompiledFunctionConditionField,
    visit: (item: unknown, index: number) => boolean | void,
    { fromEnd = false, when = true }: { fromEnd?: boolean; when?: boolean } = {}
): Promise<Return | null> {
    return eachElement(
        fn,
        ctx,
        names,
        async (item, i) => {
            const run: Return = await fn["resolveCondition"](ctx, condition)
            if (!run.success && !run.return) return run

            if (isTrue(run) === when && visit(item, i)) return true
        },
        fromEnd
    )
}
