import { Router } from "express";
import { AuthRoutes } from "@modules/auth/routes/auth.route";


export class AppRoutes {
    public router: Router;

     constructor() {
        this.router = Router();
        this.initializeRoutes();
    }

      private initializeRoutes() {
        this.router.use('/auth', new AuthRoutes().router);
      }
}

export default new AppRoutes().router;