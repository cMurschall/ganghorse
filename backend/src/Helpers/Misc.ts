import { join } from "path"


export const appPort = 3000;

export const appUrl = process.env.NODE_ENV === "production"
    ? "https:/gang.horse"
    : `http://localhost:8088`;

export const serverUrl = process.env.NODE_ENV === "production"
    ? "https:/gang.horse"
    : `http://localhost:${appPort}`;


export const sleep = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const maxImagesPerHorse = 10

export const maxVideosPerHorse = 5

export const uploadPath = process.env.STATIC_UPLOADS_PATH_CONTAINER || 'uploads';

export const uploadPrefix = '/uploads';

export const blogImagePrefix = '/blogAssets';

export const blogPostPath = process.env.NODE_ENV === "production"
    ? process.env.STATIC_BLOGPOSTS_PATH_CONTAINER || 'blogPosts'
    : join(__dirname, "./../../../blogPosts"); 