import { Router } from "express";

// route initialization
const router: Router = Router();

type TRoute = {
    path: string;
    route: Router;
};

// routes data
const routes: TRoute[] = [
    // {
    //     path: '/admins',
    //     route: AdminRoutes,
    // },
];

// routes execution
routes.forEach((route) => router.use(route.path, route.route));

export default router;
