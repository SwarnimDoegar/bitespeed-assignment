export type ProcessorFunction<B,R> = (body : B, params : any) => Promise<R>

export enum HttpMethod {
    GET,
    PUT,
    POST,
    DELETE
}
