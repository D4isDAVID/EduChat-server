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

    _Limitations = 3000,
    UsernameUnavailable,
    EmailTaken,
    BadUsernameLength,
    BadPasswordLength,
}
