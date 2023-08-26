import { makeErrorResponse } from "../types/error";

export function send400Err <A> (errMessage : string) : A{
    throw makeErrorResponse(400, "Bad Request", errMessage)
}

export function send500Err <A> (errMessage : string) : A {
    throw makeErrorResponse(500, "Internal Server Error", errMessage)
}