import { ApiError } from '../../../../../api/enums/error.js';
import {
    isMessageVoteUpsertObject,
    toMessageVoteUpsertInput,
} from '../../../../../api/input/message-vote-upsert.js';
import { prisma } from '../../../../../env.js';
import { handleAuthorization } from '../../../../../http/handlers/authorization.js';
import { RouteHandler } from '../../../../../http/handlers/index.js';
import { handleInputConversion } from '../../../../../http/handlers/input-conversion.js';
import { handleJson } from '../../../../../http/handlers/json.js';
import { writeEmptyReply } from '../../../../../http/replies/empty.js';
import { writeErrorReply } from '../../../../../http/replies/error.js';

export default (async (props) => {
    const {
        response,
        params: [rawId],
    } = props;

    const user = await handleAuthorization(props);
    if (!user) return;

    const data = await handleJson(props);
    if (!data) return;

    if (!isMessageVoteUpsertObject(data)) {
        return writeErrorReply(response, ApiError.InvalidObject);
    }

    const messageId = parseInt(rawId!);
    if (isNaN(messageId)) {
        return writeErrorReply(response, ApiError.UnknownMessage);
    }

    const message = await prisma.message.findFirst({
        where: { id: messageId },
    });

    if (!message) {
        return writeErrorReply(response, ApiError.UnknownMessage);
    }

    const upsertData = toMessageVoteUpsertInput(data, message, user);
    if (!handleInputConversion(props, upsertData)) return;

    await prisma.messageVote.upsert(upsertData);

    writeEmptyReply(response);
}) satisfies RouteHandler;
