import { AuthController } from "@presentation/controllers/auth.controller";
import { Router } from "express";

export class AuthRoutes {
     router: Router;
     private controller: AuthController;

    constructor() {
        this.router = Router();
        this.controller = new AuthController();
        this.initializeRoutes();
    }

     private initializeRoutes() {
         this.router.post('/login' ,this.controller.login.bind(this.controller));
     }
}