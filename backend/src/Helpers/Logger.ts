import pino from "pino";

export const logManager = (): pino.Logger => {
    const loggingInstance = pino(
        {
            prettyPrint: {
                colorize: true,
                translateTime: true,
                levelFirst: true
            }, 
        },
        process.stdout
    );

    return loggingInstance;
};
