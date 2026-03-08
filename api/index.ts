import { app } from '../server/index';
import { registerRoutes } from '../server/routes';

let routesRegistered = false;

export default async function handler(req: any, res: any) {
    // Ensure routes are registered only once per instance
    if (!routesRegistered) {
        await registerRoutes(app);
        routesRegistered = true;
    }
    return app(req, res);
}
