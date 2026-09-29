type Part = {
    text: string;
} | {
    keys: string[];
} | {
    position: true;
} | {
    self: true;
};
export declare function parseTemplate(template: string): Part[];
export declare function fill(parts: readonly Part[], element: unknown, position: number): string;
export {};
//# sourceMappingURL=template.d.ts.map