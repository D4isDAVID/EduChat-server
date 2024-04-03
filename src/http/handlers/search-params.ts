import { getRequestUrl } from '../url.js';
import { RouteHandlerProps } from './index.js';

export type ParamFunc<T> = (key: string) => T;

export function handleSearchParams<T extends Record<string, unknown>>(
    { request }: RouteHandlerProps,
    paramFuncs: { [K in keyof T]: ParamFunc<T[K]> },
): T {
    const params = Object.fromEntries(getRequestUrl(request).searchParams);

    return (Object.keys(paramFuncs) as (keyof T)[]).reduce((p, k) => {
        const param = paramFuncs[k](params[k] ?? '');
        if (param !== null && typeof param !== 'undefined') p[k] = param;
        return p;
    }, {} as T);
}

export function intParam(param: string): number | undefined {
    const num = parseInt(param);
    if (!isNaN(num)) return num;
}

export function filterParam<T>(
    func: ParamFunc<T>,
    filter: (param: NonNullable<T>) => boolean,
): ParamFunc<T | undefined> {
    return (key) => {
        const param = func(key);
        if (param !== null && typeof param !== 'undefined' && filter(param))
            return param;
    };
}

export function defaultValueParam<T>(
    func: ParamFunc<T>,
    defaultValue: NonNullable<T>,
): ParamFunc<NonNullable<T>> {
    return (key) => {
        const param = func(key);
        if (param !== null && typeof param !== 'undefined') return param;
        return defaultValue;
    };
}
