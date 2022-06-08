import "reflect-metadata";
import "./env";

import https from 'https'
import { createServer } from 'http'
// import fs from "fs";
// import path from "path";

import cluster from 'cluster'
import net from 'net'
import os from 'os'
import farmhash from 'farmhash'



import Express from 'express';
import cors from "cors";
import bodyParser from 'body-parser'

import redisAdapter from 'socket.io-redis';
import ioserver from 'socket.io';

import { useContainer as routingContainer, useExpressServer, Action } from "routing-controllers";
import { useContainer as socketContainer, useSocketServer } from 'socket-controllers';
import { Container } from "typedi";
import { useContainer as typeContainer } from "typeorm";
import { logManager } from "./Helpers/Logger";
import { createPostgresConnection, clearAllTables } from "./Helpers/Database";
import { DataFaker } from "./Helpers/DataFaker";

import session, { SessionOptions } from "express-session";
import { v4 as uuid } from 'uuid';
import connectRedis from "connect-redis";
import { RedisClient } from "redis";
import { createAdapter as createSocketIoRedisAdapter } from 'socket.io-redis';
// @ts-ignore
import morgan from "morgan";

import { redis } from "./Helpers/Redis";
import { User } from "./Models/UserEntity";
import { Horse } from "./Models/HorseEntity";

import { HorseController } from "./Controllers/HorseController"
import { LocationController } from "./Controllers/LocationController"
import { MessageController } from "./Controllers/MessageController"
import { UserController } from "./Controllers/UserController"
import { WorldFengurController } from "./Controllers/WorldFengurController"
import { ImageController } from "./Controllers/ImageController"
import { FavoritesController } from "./Controllers/FavoritesController"
import { BlogController } from "./Controllers/BlogController";
import { UserSearchController } from "./Controllers/UserSearchController";
import { VideoController } from "./Controllers/VideoController";
import { HomeController } from "./Controllers/HomeController";


import { ConversationSocket } from "./Sockets/ConversationSocket"

import { MailJetMailer } from "./Helpers/Mailer/MailJetMailer";
import { DebugMailer } from "./Helpers/Mailer/DebugMailer";
import { GangHorseMailer } from "./Helpers/Mailer/GangHorseMailer";


import { appUrl, appPort, uploadPath, uploadPrefix, blogPostPath, blogImagePrefix } from "./Helpers/Misc";
import { Vacuumer } from "./Helpers/Runners/Vacuumer";
import { CurrencyConverter } from "./Helpers/CurencyConverter";

import makeApiMiddleware from "./Helpers/Monitor"
import { AnitarFetcher } from "./Helpers/HorseData/AnitarFetcher";
import { Aws } from "./Helpers/Aws";




const logger = logManager();


var converter = new CurrencyConverter()


routingContainer(Container);
socketContainer(Container);
typeContainer(Container);

Container.set('logger', logger)
Container.set('mailer', new MailJetMailer())
// Container.set('mailer', new DebugMailer())
Container.set('currencyConverter', converter)
Container.set('horseDataFetcher', new AnitarFetcher())
Container.set('aws', new Aws())


logger.info("booting")


let vacuumers: Vacuumer[] = []
const bootstrap = async () => {

    var connection = await createPostgresConnection({
        enableLogging: false, synchronize: false
    })

    if (cluster.isMaster) {
        logger.info("look for migrations")
        const conductedMigrations = await connection.runMigrations();
        logger.info(conductedMigrations.length + " migrations executed")

        var clearTables = process.env.NODE_ENV !== "production" && false;
        var prefillDbWithFakeData = process.env.NODE_ENV !== "production" && false;

        if (clearTables) {
            await clearAllTables(connection);
        }

        if (prefillDbWithFakeData) {
            var faker = new DataFaker(connection);
            console.log("start fill fake data")
            try {
                await faker.fillDatabase(500, 15)
            } catch (error) {
                console.error('fake db failed', error)
            }

        }

        vacuumers.push(new Vacuumer(uploadPath, connection))
    }


    const numProcesses = os.cpus().length

    if (cluster.isMaster) {

        let workers: Record<number, cluster.Worker> = {};
        // Helper function for spawning worker at index 'i'.
        var spawnWorker = (i: number) => {
            workers[i] = cluster.fork();

            // Restart worker on exit
            workers[i].on('exit', () => {
                console.log('respawning worker', i);
                spawnWorker(i);
            });
        };

        // Spawn workers.
        for (var i = 0; i < numProcesses; i++) {
            spawnWorker(i);
        }

        console.log(`Spawned ${Object.keys(workers).length} workers`)


    } else {
        try {


            await converter.update()



            // creates express app, registers all controller routes and returns you express app instance
            const app = Express();

            app.enable('trust proxy');
            app.disable('x-powered-by');

            app.use(makeApiMiddleware())
            // app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))
            app.use(
                cors({
                    credentials: true,
                    origin: appUrl
                })
            );



            app.use(uploadPrefix, Express.static(uploadPath));
            app.use(blogImagePrefix, Express.static(blogPostPath));

            app.use((_, res, next) => {
                res.set('X-Recruiting', 'Sorry - still a one man show.');
                next();
            });

            // parse application/x-www-form-urlencoded
            app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }))
            app.use(bodyParser.text())

            const RedisStore = connectRedis(session); // connect node.req.session to redis backing store

            const sessionOption: SessionOptions = {
                store: new RedisStore({
                    client: (redis as unknown) as RedisClient,
                    ttl: 86400 // 1 day
                }),
                genid: (_req) => {
                    let newUuid = uuid();
                    return newUuid;
                },

                name: "sessionId",
                proxy: process.env.NODE_ENV === "production",
                secret: process.env.SESSION_SECRET || "copyCat",
                resave: false,
                saveUninitialized: true,
                cookie: {
                    httpOnly: process.env.NODE_ENV === "production",
                    domain: process.env.NODE_ENV === "production" ? 'gang.horse' : 'localhost',
                    secure: false,
                    sameSite: "lax",
                    maxAge: 1000 * 60 * 60 * 24 * 1 * 365, // 1 years        
                }
            };
            const sessionMiddleware = session(sessionOption);
            app.use(sessionMiddleware);


            // returning a stream is for routing-controllers difficult, therefore this extra handler.
            app.get("/video/youtubeThumbnail/:id", (req, res) => {
                // returnes a youtube video thumbnail of a given youtube video id.
                const { id } = req.params

                const request = https.get(`https://img.youtube.com/vi/${id}/0.jpg`, (response) => {
                    res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
                    response.pipe(res);
                })
                request.on('error', error => {
                    console.error('error', error)
                })
            })

            useExpressServer(app, {
                controllers: [HorseController,
                    LocationController,
                    MessageController,
                    UserController,
                    WorldFengurController,
                    ImageController,
                    FavoritesController,
                    BlogController,
                    UserSearchController,
                    VideoController,
                    HomeController,
                    ConversationSocket
                ],
                authorizationChecker: async (action: Action, _roles: string[]) => {

                    const child = logger.child(action.request.session)
                    child.info('authorizationChecker: ')

                    // here you can use request/response objects from action
                    // also if decorator defines roles it needs to access the action
                    // you can use them to provide granular access check
                    // checker must return either boolean (true or false)
                    // either promise that resolves a boolean value

                    // return !!action.request.session.userId;      
                    if (action.request.session.hasOwnProperty('userId')) {
                        var user = await connection.getRepository(User).findOneOrFail({ id: action.request.session.userId })
                        return user !== undefined;
                    } else {
                        return false;
                    }
                },
                currentUserChecker: async (action: Action) => {
                    if (action.request.session.userId) {
                        return await connection.getRepository(User).findOneOrFail({ id: action.request.session.userId })
                    }
                    return false
                }
            });
            const server = createServer(app);
            const io = ioserver(server, {
                path: "/socket",
                transports: ["websocket"]
            })

            // Tell Socket.IO to use the redis adapter
            io.adapter(createSocketIoRedisAdapter({
                pubClient: redis,
                subClient: redis.duplicate()
            }));

            useSocketServer(io, {
                controllers: [ConversationSocket]
            });
            io.use((socket, next) => {
                sessionMiddleware(socket.request, socket.request.res || {}, next);
                // sessionMiddleware(socket.request, socket.request.res, next); will not work with websocket-only
                // connections, as 'socket.request.res' will be undefined in that case
            });


            logger.info(`Running at http://localhost:${appPort} in mode: ${process.env.NODE_ENV},  worker ${cluster.worker.id}`)
  


            server.listen(appPort);

        } catch (error) {
            console.error(error)
        }
    }
}


bootstrap();