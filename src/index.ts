import express, { Express, Request, Response } from 'express';
import initDB from './db/init'
import registerRouteHandlers from './server';

async function main() {
    const app: Express = express();
    const port = process.env.PORT;

    app.use(express.json());
    initDB();
    registerRouteHandlers(app)
    app.listen(port, () => {
        console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
    });

}

main()
