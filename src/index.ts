import express, { Express, Request, Response } from 'express';
import initDB from './db/init'
import registerRouteHandlers from './routes';

async function main() {
    const app: Express = express();
    const port = process.env.PORT || 8080;

    app.use(express.json());
    await initDB();
    await registerRouteHandlers(app)
    app.listen(port, () => {
        console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
    });

}

main()
