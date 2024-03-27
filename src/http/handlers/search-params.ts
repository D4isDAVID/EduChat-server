import { getRequestUrl } from '../url.js';
import { RouteHandlerProps } from './index.js';

export const handleSearchParams = ({
    request,
}: RouteHandlerProps): Record<string, string> => {
    return Object.fromEntries(getRequestUrl(request).searchParams);
};
