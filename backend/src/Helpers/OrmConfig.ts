import { join } from "path"

import { ConnectionOptions } from 'typeorm';
import { Horse } from "../Models/HorseEntity";
import { User } from "../Models/UserEntity";
import { ImageUrl } from "../Models/ImageUrlEntity";
import { VideoUrl } from "../Models/VideoEntity";
import { Location } from "../Models/LocationEntity";
import { Message } from "../Models/MessageEntity";
import { Favorite } from "../Models/FavoriteEntity";
import { WorldFengurHorse } from "../Models/WorldFengurHorse";
import { UserSearch } from "../Models/UserSearchEntity";
import { Conversation } from "../Models/ConversationEntity";
import { PrivateMessage } from "../Models/PrivateMessageEntity";


const config: ConnectionOptions = {
    type: "postgres",
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: "iceHorseFair",
    entities: [
        Horse,
        User,
        ImageUrl,
        VideoUrl,
        Location,
        Message,
        Favorite,
        WorldFengurHorse,
        UserSearch,
        Conversation,
        PrivateMessage
    ],
    migrations: [
        join(__dirname, '../', 'Migrations', '*{.js,.ts}')
    ],
    synchronize: false,
    logging: false,
    extra: {
        max: 10 // set pool siz
    },
    cli: {
        migrationsDir: './src/Migrations/',
    }
};
export = config;