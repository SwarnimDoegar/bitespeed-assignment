export interface ErrorResponse {
    code : number;
    body : ErrorPayload;

};

export interface ErrorPayload {
    userMessage : string;
    errMessage : string;
    error : boolean;
}

export function makeErrorResponse(code : number, userMessage : string, errMessage : string) : ErrorResponse {
    return {
        code,
        body: {
            userMessage,
            errMessage,
            error: true
        }
    }
}
