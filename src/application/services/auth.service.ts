import { BruteForceProtection } from "@infrastructure/security/bruteforce-protection";
import { JWTGenerator } from "@infrastructure/security/cryptography/jwt";

export class AuthService { 
    private bruteForceProtection : BruteForceProtection;
    private jwt :JWTGenerator;

     constructor (){
        this.bruteForceProtection = new BruteForceProtection(5, 15 * 60 * 1000, 15 * 60 * 1000)
        this.jwt = new JWTGenerator()
    }

     public async login(body: any,ip:string): Promise<any> {  
        let accessToken=''
        let refreshToken=''
        return  { accessToken, refreshToken };  
     }

}