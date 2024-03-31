export enum ApiError {
    Generic = 0,

    _Unknown = 1000,
    UnknownUser,
    UnknownCategory,

    _Validations = 2000,
    InvalidObject,
    BadUsernameFormat,
    BadEmailFormat,
    BadPasswordFormat,
    InvalidAuthorization,
    InvalidUsername,
    InvalidPassword,
    BadCategoryName,
    BadPostTitle,

    _Limitations = 3000,
    NotStudentOrTeacher,
    UsernameUnavailable,
    EmailTaken,
    BadUsernameLength,
    BadPasswordLength,
    NewPasswordIsCurrent,

    _Permissions = 4000,
    NoPermission,
    CategoryLocked,
}
