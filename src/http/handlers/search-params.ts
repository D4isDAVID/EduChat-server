import { getRequestUrl } from '../url.js';
import { RouteHandlerProps } from './index.js';

export type ParamFunc<T> = (key: string) => T | null | undefined | void;

export function handleSearchParams<K extends string, V>(
    { request }: RouteHandlerProps,
    paramFuncs: Record<K, ParamFunc<V>>,
): Record<K, V> {
    const params = Object.fromEntries(getRequestUrl(request).searchParams);

    return (Object.keys(params) as K[])
        .filter((k) => k in paramFuncs)
        .reduce(
            (p, k) => {
                const param = paramFuncs[k](params[k]!);
                if (param !== null && typeof param !== 'undefined')
                    p[k] = param;
                return p;
            },
            {} as Record<K, V>,
        );
}

export function intParam(param: string): number | void {
    const num = parseInt(param);
    if (!isNaN(num)) return num;
}

export function filterParam<T>(
    func: ParamFunc<T>,
    filter: (param: T) => boolean,
): ParamFunc<T> {
    return (key) => {
        const param = func(key);
        if (param !== null && typeof param !== 'undefined' && filter(param))
            return param;
    };
}

export function defaultValueParam<T>(
    func: ParamFunc<T>,
    defaultValue: T,
): ParamFunc<T> {
    return (key) => {
        const param = func(key);
        if (param !== null && typeof param !== 'undefined') return param;
        return defaultValue;
    };
}
