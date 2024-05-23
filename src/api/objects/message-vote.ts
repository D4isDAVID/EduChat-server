import { MessageVote } from '@prisma/client';
import { prisma } from '../../env.js';
import { UserObject, createUserObject } from './user.js';

export type MessageVoteObject = {
    readonly messageId: number;
    readonly user: UserObject;
    readonly positive: boolean;
};

export async function createMessageVoteObject(
    vote: MessageVote,
): Promise<MessageVoteObject> {
    const user = (await prisma.user.findFirst({
        where: { id: vote.userId },
    }))!;

    return {
        messageId: vote.messageId,
        user: await createUserObject(user),
        positive: vote.positive,
    };
}

export async function createMessageVotesArray(
    votes: MessageVote[],
): Promise<MessageVoteObject[]> {
    return Promise.all(votes.map((v) => createMessageVoteObject(v)));
}
