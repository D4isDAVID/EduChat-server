import { ApiError } from '../enums/error.js';

export function validateEmoji(emoji: string): ApiError | undefined {
    if (!emoji.match(/^\p{Emoji_Presentation}$/u)) {
        return ApiError.InvalidEmoji;
    }
}
