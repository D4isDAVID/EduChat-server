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
        params: [rawId, emoji],
    } = props;

    const emojiError = validateEmoji(emoji!);
    if (typeof emojiError !== 'undefined') {
        return writeErrorReply(response, emojiError);
    }

    const user = await handleAuthorization(props);
    if (!user) return;

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

    await prisma.reaction.delete({
        where: {
            messageId_emoji_userId: {
                messageId,
                emoji: emoji!,
                userId: user.id,
            },
        },
    });

    writeEmptyReply(response);
}) satisfies RouteHandler;
