
import express, { Application, Request, Response } from "express";
import envConfig from "./config/env.config";
import morgan from "morgan";
import path from "path";
import fs from "fs";
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from "cookie-parser";
import { logger } from "./logger";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger/swagger.config";
import { ErrorHandler, HandleUnCaughtException } from "./errors";
import { connectToDatabase } from "./database/mongoose.config";
import router from "@presentation/routes";
import { RabbitMQConnection } from "./rabbitmq/connection/rabbitmq.connection";
import { redisClientInstance } from "./redis/redis.config";


export class ServerInfrastructure {
        private app :Application
        private rabbitMQConnection : RabbitMQConnection

        constructor(){
            this.app = express()
            this.rabbitMQConnection = new RabbitMQConnection()

        }

        /**
        * @Configures and initializes server middlewares.
         */
         private initializeMiddlewares(): void {
            this.app.set('trust proxy', 1);
            this.configureMorgan();
            this.app.use(cors({ origin: "*", credentials: true }));
            this.app.use(helmet());
            this.app.use(express.urlencoded({ extended: true }));
            this.app.use(express.json());
            this.app.use(cookieParser());
         }

               /**
        * @morgan Configuration
        * This will create logs in the production time , Incase anything wrong happens we can have the track 
        */

        private configureMorgan(): void {
            const logFormat = envConfig.NODE_ENV === "production" ? "combined" : "dev";
            this.app.use(morgan(logFormat));
            if (envConfig.NODE_ENV === "production") {
            const logDirectory = path.join(path.resolve(), "logs");
            if (!fs.existsSync(logDirectory)) {
                fs.mkdirSync(logDirectory);
            }
            const logStream = fs.createWriteStream(path.join(logDirectory, "requests.log"), { flags: "a" });
            this.app.use(morgan("combined", { stream: logStream }));
        }}

          /**
        * This will be handling all the errors accross the server
        */
        private errorHandler(): void {
            this.app.use(ErrorHandler);
            process.on("uncaughtException", HandleUnCaughtException);
         process.on("unhandledRejection", (reason: any) => {
                logger.error("Unhandled Rejection:", reason);
                process.exit(1);
            });
        }   

            /**
        * @route - config
        */

        private async routeConfig(): Promise<void>{
        this.app.use('/',router);
    }

         /**
        * This is to validate that server is online
        */
        private async PING(): Promise<void> {
            this.app.get('/ping', async (req: Request, res: Response): Promise<void> => {
                res.send(' TEMPLATE SERVICE IS ONLINE!!!');
            });
        }

           /**
         * This Private function will Initialize the Swagger and setup the UI For Swagger
         */

        private initializeSwagger(): void {
            if(envConfig.NODE_ENV !== 'production'){
                logger.info('Swagger is available')
                this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
            }
        }

              /**
        * This will start listening to the server
        */
         private startListening(): void {
            const port = envConfig.PORT;
            this.app.listen(port, () => {
                logger.info(`Server listening on port ${port} - ${envConfig.NODE_ENV} server`);
            }).on("error", (error) => {
                console.log(error)
                logger.error("Server Error:", error);
                process.exit(1);
            });
        }   
    
           /**
        * This is the place where the server is initializing
        */
          public async initializeServer(): Promise<void> {
             this.initializeMiddlewares();
             this.PING(); 
             this.routeConfig();  
             this.initializeSwagger(); 
             await this.rabbitMQConnection.initialize();
             await connectToDatabase(); 
             await redisClientInstance.connect();
             this.startListening();
             this.errorHandler();
          }

}