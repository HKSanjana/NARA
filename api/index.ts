import { app } from '../server/index';
import { registerRoutes } from '../server/routes';

export default async function handler(req: any, res: any) {
    // Ensure routes are registered before handling the request
    await registerRoutes(app);
    return app(req, res);
}
