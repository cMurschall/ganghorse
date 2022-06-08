import { createConnection, Connection } from "typeorm"
import { sleep } from "./Misc";
import ormConfig from "./OrmConfig"

export interface ConnectionOptions {
    synchronize?: boolean
    enableLogging?: boolean
}


export const createPostgresConnection = async (options: ConnectionOptions): Promise<Connection> => {

    for (let index = 0; index < 10; index++) {
        try {
            return await createDbConnection(options);
        } catch (error) {
            await sleep(1000)
        }
    }
    return await createDbConnection(options);
}



export const clearAllTables = async (connection: Connection) => {
    await connection.transaction(async transactionalEntityManager => {
        // order of execution matters here. 
        await transactionalEntityManager.query("delete from public.messages");
        await transactionalEntityManager.query("delete from public.horses");
        await transactionalEntityManager.query("delete from public.imageurls");
        // await transactionalEntityManager.query("delete from public.users");
    });
}


async function createDbConnection(options: ConnectionOptions) {
    let { synchronize = false, enableLogging = false } = options;

    const connection = await createConnection({...ormConfig, ...{synchronize, logging : enableLogging}});
    return connection;
}

