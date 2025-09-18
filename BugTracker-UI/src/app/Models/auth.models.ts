export interface LoginRequest
{
    LoginIdentifier : string;
    Password : string;
}

export interface LoginResponse
{
    userId : number;
    userName : string;
    role : string;
    token : string;
}