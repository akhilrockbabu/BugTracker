export interface LoginRequest
{
    LoginIdentifier : string;
    Password : string;
}

export interface LoginResponse
{
    UserId : number;
    UserName : string;
    Role : string;
    Token : string;
}