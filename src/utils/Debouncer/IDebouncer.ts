export interface IDebouncer<TArgs extends unknown[], TResult> {
    run(key: string, fn: (...args: TArgs) => Promise<TResult>, ...args: TArgs): Promise<TResult>;
    cancel?(key: string): void;
}
