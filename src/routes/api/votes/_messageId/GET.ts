import { Prisma } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { ApiError } from '../../../../api/enums/error.js';
import { createMessageVotesArray } from '../../../../api/objects/message-vote.js';
import { prisma } from '../../../../env.js';
import { RouteHandler } from '../../../../http/handlers/index.js';
import {
    defaultValueParam,
    filterParam,
    handleSearchParams,
    intParam,
} from '../../../../http/handlers/search-params.js';
import { writeErrorReply } from '../../../../http/replies/error.js';
import { writeJsonReply } from '../../../../http/replies/json.js';

export default (async (props) => {
    const {
        response,
        params: [rawId],
    } = props;

    const { limit, after, positive } = handleSearchParams(props, {
        limit: defaultValueParam(
            filterParam(intParam, (x) => x >= 1 && x <= 20),
            20,
        ),
        after: intParam,
        positive: intParam,
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

    const findData: Prisma.MessageVoteFindManyArgs<DefaultArgs> = {
        where: { messageId: message.id },
        take: limit,
        orderBy: { createdAt: 'asc' },
    };

    if (typeof after !== 'undefined') {
        findData.cursor = {
            messageId_userId: {
                messageId: message.id,
                userId: after,
            },
        };
        findData.skip = 1;
    }

    if (typeof positive !== 'undefined') {
        findData.where!.positive = positive != 0;
    }

    const votes = await prisma.messageVote.findMany(findData);

    writeJsonReply(response, await createMessageVotesArray(votes));
}) satisfies RouteHandler;
