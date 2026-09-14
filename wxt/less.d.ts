declare module 'less' {
    const less: {render(input: string, options: Record<string, unknown>): Promise<{css: string; imports: string[]}>};
    export default less;
}
