import { Prisma } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { ApiError } from '../../../../../api/enums/error.js';
import { createReactionsArray } from '../../../../../api/objects/reaction.js';
import { validateEmoji } from '../../../../../api/validators/emoji.js';
import { prisma } from '../../../../../env.js';
import { RouteHandler } from '../../../../../http/handlers/index.js';
import {
    defaultValueParam,
    filterParam,
    handleSearchParams,
    intParam,
} from '../../../../../http/handlers/search-params.js';
import { writeErrorReply } from '../../../../../http/replies/error.js';
import { writeJsonReply } from '../../../../../http/replies/json.js';

export default (async (props) => {
    const {
        response,
        params: [rawId, emoji],
    } = props;

    const emojiError = validateEmoji(emoji!);
    if (typeof emojiError !== 'undefined') {
        return writeErrorReply(response, emojiError);
    }

    const { limit, after } = handleSearchParams(props, {
        limit: defaultValueParam(
            filterParam(intParam, (x) => x >= 1 && x <= 20),
            20,
        ),
        after: intParam,
    });

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

    const findData: Prisma.ReactionFindManyArgs<DefaultArgs> = {
        where: { messageId: message.id, emoji: emoji! },
        take: limit,
        orderBy: { createdAt: 'asc' },
    };

    if (typeof after !== 'undefined') {
        findData.cursor = {
            messageId_emoji_userId: {
                messageId: message.id,
                emoji: emoji!,
                userId: after,
            },
        };
        findData.skip = 1;
    }

    const reactions = await prisma.reaction.findMany(findData);

    writeJsonReply(response, await createReactionsArray(reactions));
}) satisfies RouteHandler;
