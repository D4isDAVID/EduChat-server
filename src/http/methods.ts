const supportedMethods = [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'HEAD',
    'OPTIONS',
] as const;

export type SupportedMethod =
    typeof supportedMethods extends ReadonlyArray<infer M> ? M : never;

export function isSupportedMethod(method: string): method is SupportedMethod {
    return (supportedMethods as unknown as string[]).includes(method);
}
