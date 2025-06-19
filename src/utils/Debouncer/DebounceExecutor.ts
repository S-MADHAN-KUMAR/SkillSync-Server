import { debounce } from "lodash";
import { IDebouncer } from "./IDebouncer";

// Define a function type that includes lodash's cancel method
type CancellableDebounce<TArgs extends unknown[]> = ((...args: TArgs) => void) & {
    cancel: () => void;
};

export class DebounceExecutor<TArgs extends unknown[], TResult> implements IDebouncer<TArgs, TResult> {
    private debounceMap = new Map<string, {
        fn: CancellableDebounce<TArgs>;
        promise: Promise<TResult>;
        resolve: (value: TResult) => void;
        reject: (reason?: unknown) => void;
    }>();

    constructor(private delay: number) { }

    run(key: string, fn: (...args: TArgs) => Promise<TResult>, ...args: TArgs): Promise<TResult> {
        // Cancel existing debounce if exists
        const existing = this.debounceMap.get(key);
        if (existing) {
            existing.reject(new Error("Debounced by a new call"));
            this.cancel(key);
        }

        let resolveFn!: (value: TResult) => void;
        let rejectFn!: (reason?: unknown) => void;

        const promise = new Promise<TResult>((resolve, reject) => {
            resolveFn = resolve;
            rejectFn = reject;
        });

        const debounced: CancellableDebounce<TArgs> = debounce(
            async (...debounceArgs: TArgs) => {
                try {
                    const result = await fn(...debounceArgs);
                    resolveFn(result);
                } catch (err) {
                    rejectFn(err);
                } finally {
                    this.debounceMap.delete(key);
                }
            },
            this.delay
        ) as CancellableDebounce<TArgs>;

        debounced(...args);

        this.debounceMap.set(key, {
            fn: debounced,
            promise,
            resolve: resolveFn,
            reject: rejectFn
        });

        return promise;
    }

    cancel(key: string): void {
        const entry = this.debounceMap.get(key);
        if (entry) {
            entry.fn.cancel();
            this.debounceMap.delete(key);
        }
    }
}
