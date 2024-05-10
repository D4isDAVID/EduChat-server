import { ApiError } from '../../../../../../api/enums/error.js';
import { validateEmoji } from '../../../../../../api/validators/emoji.js';
import { prisma } from '../../../../../../env.js';
import { handleAuthorization } from '../../../../../../http/handlers/authorization.js';
import { RouteHandler } from '../../../../../../http/handlers/index.js';
import { writeEmptyReply } from '../../../../../../http/replies/empty.js';
import { writeErrorReply } from '../../../../../../http/replies/error.js';

export default (async (props) => {
    const {
        response,
        params: [rawId, emoji, rawUserId],
    } = props;

    const emojiError = validateEmoji(emoji!);
    if (typeof emojiError !== 'undefined') {
        return writeErrorReply(response, emojiError);
    }

    const user = await handleAuthorization(props);
    if (!user) return;

    if (!user.admin) {
        return writeErrorReply(response, ApiError.NoPermission);
    }

    const messageId = parseInt(rawId!);
    if (isNaN(messageId)) {
        return writeErrorReply(response, ApiError.UnknownMessage);
    }

    const userId = parseInt(rawUserId!);
    if (isNaN(userId)) {
        return writeErrorReply(response, ApiError.UnknownUser);
    }

    const message = await prisma.message.findFirst({
        where: { id: messageId },
    });

    if (!message) {
        return writeErrorReply(response, ApiError.UnknownMessage);
    }

    const target = await prisma.user.findFirst({
        where: { id: userId },
    });

    if (!target) {
        return writeErrorReply(response, ApiError.UnknownUser);
    }

    await prisma.reaction.delete({
        where: {
            messageId_emoji_userId: {
                messageId,
                emoji: emoji!,
                userId,
            },
        },
    });

    writeEmptyReply(response);
}) satisfies RouteHandler;
