import { Express, Request, Response } from 'express';
import {makeErrorResponse, ErrorResponse} from './types/error'

type ProcessorFunction<B,R> = (body : B, params : any) => R

enum HttpMethod {
    GET,
    PUT,
    POST,
    DELETE
}

async function runProcessor<B,R> (req : Request, res : Response, processor : ProcessorFunction<B,R>){
    try {
        let params = {...req.params, ...req.headers, ...req.query}
        let pRes = processor(req.body, params);
        res.status(200).send(pRes);
    } catch (err1) {
        try {
            let err : ErrorResponse = JSON.parse(JSON.stringify(err1));
            res.status(err.code ?? 500).send(err.body ?? "Internal server error");
        } catch (err2) {
            let err = makeErrorResponse(500, "Internal server error", JSON.stringify(err1))
            res.status(err.code).send(err.body);
        }
    }
}

function makeHandler (app : Express) {
    return function <B,R> (method : HttpMethod, path : string, processor : ProcessorFunction<B,R>){
        switch (method) {
            case HttpMethod.GET:
                app.get(path, (req, res) => runProcessor(req, res, processor));
                break;
            case HttpMethod.PUT:
                app.put(path, (req, res) => runProcessor(req, res, processor));
                break;
            case HttpMethod.POST:
                app.post(path, (req, res) => runProcessor(req, res, processor));
                break;
            case HttpMethod.DELETE:
                app.delete(path, (req, res) => runProcessor(req, res, processor));
                break;
            default:
                break;
        }
    }
}


export default function registerRouteHandlers (app : Express){
    const routeHandler = makeHandler(app);
    // routeHandler(HttpMethod.GET, "/identify", )

}