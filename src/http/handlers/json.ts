import { writeStatusReply } from '../replies/error.js';
import { JsonType } from '../replies/json.js';
import { HttpStatusCode } from '../status.js';
import { handleData } from './data.js';
import { RouteHandlerProps } from './index.js';

export async function handleJson(
    props: RouteHandlerProps,
): Promise<JsonType | undefined> {
    const { request, response } = props;

    const data = await handleData(props);

    const contentType = request.headers['content-type'];
    if (!contentType || !contentType.startsWith('application/json')) {
        return writeStatusReply(response, HttpStatusCode.BadRequest);
    }

    try {
        return JSON.parse(data);
    } catch {
        return writeStatusReply(response, HttpStatusCode.BadRequest);
    }
}
