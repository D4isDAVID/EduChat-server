import { ApiError } from '../../../../../api/enums/error.js';
import { NotificationType } from '../../../../../api/enums/notification-type.js';
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
        include: { post: true },
    });

    if (!message) {
        return writeErrorReply(response, ApiError.UnknownMessage);
    }

    if (!message.parentId && !message.post) {
        return writeErrorReply(response, ApiError.UnknownPost);
    }

    const post = await prisma.post.findFirst({
        where: { messageId: message.parentId || message.id },
    });

    if (!post) {
        return writeErrorReply(response, ApiError.UnknownPost);
    }

    const upsertData = toMessageVoteUpsertInput(data, message, user);
    if (!handleInputConversion(props, upsertData)) return;

    await prisma.messageVote.upsert(upsertData);

    if (user.id !== message.authorId) {
        await prisma.notification.create({
            data: {
                type: NotificationType.NewMessageVote,
                target: { connect: { id: message.authorId } },
                user: { connect: { id: user.id } },
                post: { connect: { messageId: post.messageId } },
                message: { connect: { id: message.id } },
                messageVote: {
                    connect: {
                        messageId_userId: {
                            messageId: message.id,
                            userId: user.id,
                        },
                    },
                },
            },
        });
    }

    writeEmptyReply(response);
}) satisfies RouteHandler;
