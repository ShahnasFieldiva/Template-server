import { AuthService } from "@application/services/auth.service";
import envConfig from "@infrastructure/config/env.config";
import { NextFunction, Request, Response } from "express";

export class AuthController{ 
    private authService: AuthService;
    
     constructor() {
        this.authService = new AuthService();
    }

    public async login(req: Request, res: Response, next: NextFunction): Promise<any> {  
    try {  
        const ip = req.ip || "UNKNOWN_IP"
            
        const token = await this.authService.login(req.body,ip);  
        res.cookie("refreshToken", token.refreshToken, {
            httpOnly: true, 
            secure: envConfig.NODE_ENV === "production", // Use Secure flag in production (HTTPS only)
            sameSite: "strict", 
            // path: "/refreshtoken" // Restrict cookie usage to this endpoint
            path: "/"
        });
        return res.json({ message :"Login successfull !!" ,AccessToken:token.accessToken });  
    } catch (error) {  
        next(error);       
    }  
}
}