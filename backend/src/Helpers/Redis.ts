import Redis from "ioredis";


export const redis = new Redis({
    port: parseInt(process.env.REDIS_Port || '6379', 10), // Redis port
    host: process.env.REDIS_HOST, // Redis host
})