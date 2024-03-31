export enum ApiError {
    Generic = 0,

    _Unknown = 1000,
    UnknownUser,

    _Validations = 2000,
    InvalidObject,
    BadUsernameFormat,
    BadEmailFormat,
    BadPasswordFormat,
    InvalidAuthorization,
    InvalidUsername,
    InvalidPassword,
    BadCategoryName,

    _Limitations = 3000,
    NotStudentOrTeacher,
    UsernameUnavailable,
    EmailTaken,
    BadUsernameLength,
    BadPasswordLength,
    NewPasswordIsCurrent,
    NoPermission,
}
