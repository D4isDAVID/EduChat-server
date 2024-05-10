import { createUserObject } from '../../../../api/objects/user.js';
import { handleAuthorization } from '../../../../http/handlers/authorization.js';
import { RouteHandler } from '../../../../http/handlers/index.js';
import { writeJsonReply } from '../../../../http/replies/json.js';

export default (async (props) => {
    const { response } = props;

    const user = await handleAuthorization(props);
    if (!user) return;

    return writeJsonReply(response, await createUserObject(user));
}) satisfies RouteHandler;
