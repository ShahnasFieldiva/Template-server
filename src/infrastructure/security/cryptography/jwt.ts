import jwt, { JwtPayload } from 'jsonwebtoken';
import envConfig from '@infrastructure/config/env.config'; 
import { AuthorizeError, BadRequestError } from '@infrastructure/errors';


export class JWTGenerator {
    private accessTokenSecret: string;
    private refreshTokenSecret: string;
    private accessTokenExpiry: string;
    private refreshTokenExpiry: string;
    private InternalTokenSecret: string;

    constructor() {
        this.accessTokenSecret = String(envConfig.ACCESS_TOKEN_SECRET);
        this.refreshTokenSecret = String(envConfig.REFRESH_TOKEN_SECRET);
        this.accessTokenExpiry = String(envConfig.ACCESS_TOKEN_EXPIRY);
        this.refreshTokenExpiry = String(envConfig.REFRESH_TOKEN_EXPIRY);
        this.InternalTokenSecret = String(envConfig.INTERNAL_JWT_SECRET)
    }

    public generateAccessToken(data: object): string {
        return jwt.sign(data, this.accessTokenSecret, { expiresIn: "7d" });
    }

    public generateRefreshToken(data: object): string {
        return jwt.sign(data, this.refreshTokenSecret, { expiresIn: "7d" });
    }

    public generateInternalToken(data:object): string{
        return jwt.sign(data, this.InternalTokenSecret,{expiresIn:"10m"})
    }

    public verifyRefreshToken(refreshToken:string){
        
        try {
            const decoded = jwt.verify(refreshToken, this.refreshTokenSecret);
            
            if (typeof decoded === "string") {
                throw new AuthorizeError("Invalid token format");
            }

            return decoded as JwtPayload;
        } catch (error) {
            throw new AuthorizeError("Invalid Refresh Token")
        }
    }
}
