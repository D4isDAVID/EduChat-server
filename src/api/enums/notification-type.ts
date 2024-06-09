export enum NotificationType {
    NewPostReply,
    NewMessageVote,
    HelperGranted,
    HelperRevoked,
    AdminGranted,
    AdminRevoked,
}

export const userNotifications = [
    NotificationType.NewPostReply,
    NotificationType.NewMessageVote,
    NotificationType.HelperGranted,
    NotificationType.HelperRevoked,
    NotificationType.AdminGranted,
    NotificationType.AdminRevoked,
];

export const postNotifications = [
    NotificationType.NewPostReply,
    NotificationType.NewMessageVote,
];

export const messageNotifications = [
    NotificationType.NewPostReply,
    NotificationType.NewMessageVote,
];

export const messageVoteNotifications = [NotificationType.NewMessageVote];
