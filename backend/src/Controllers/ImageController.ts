import path from 'path'
import util from 'util'
import fs from 'fs'

import multer from "multer";
import sharp from 'sharp';

import { JsonController, Post, UploadedFile, BodyParam, Body, Authorized, Session } from "routing-controllers";
import { Service, Inject } from "typedi";
import { Logger } from "pino";
import { InjectRepository } from "typeorm-typedi-extensions";

import { Repository, UpdateResult } from "typeorm";
import { v4 as uuid } from 'uuid'

import { ImageUrl } from "./../Models/ImageUrlEntity";
import { Horse } from './../Models/HorseEntity';

import { maxImagesPerHorse, serverUrl, uploadPath, uploadPrefix } from './../Helpers/Misc';
import { ISession } from './../Helpers/Authentication';




interface ImageId {
    id: string,
    showIndex: number
}

interface HorseId extends ImageId {
    feifId: string
}

const deleteFile = util.promisify(fs.unlink);

const fileUploadOptions: multer.Options = {
    storage: multer.diskStorage({
        destination: (request: any, _: Express.Multer.File, callback: (error: Error | null, filename: string) => void) => {

            const { feifId } = (JSON.parse(request.body.horseId) as HorseId)
            if (feifId) {
                let dir = path.join(uploadPath, feifId, '/')

                if (fs.existsSync(dir)) {
                    callback(null, dir)
                } else {
                    fs.mkdir(dir, (err) => {
                        if (err) callback(err, dir)
                        else callback(null, dir)
                    })
                }
            } else {
                callback(null, './uploads')
            }
        },
        filename: (_: any, file: Express.Multer.File, callback: (error: Error | null, filename: string) => void) => {
            var token = uuid()
            var fileExt = path.extname(file.originalname).toLowerCase()
            var filename = token + fileExt
            callback(null, filename)
        }
    }),
    fileFilter: (_: Express.Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
        // https://www.garykessler.net/library/file_sigs.html
        // const magicNumbers = [
        //     'ffd8ffe0', // jpg
        //     'ffd8ffe1', // jpg1
        //     '89504e47' // png
        // ]

        const mimeTypes = [
            "image/jpg",
            "image/jpeg",
            "image/png"
        ]

        const fileExtentions = [
            ".jpg",
            ".jpeg",
            ".png"
        ]

        var acceptFile = fileExtentions.includes(path.extname(file.originalname).toLowerCase())
            && mimeTypes.includes(file.mimetype)
        // && magicNumbers.includes(file.buffer.toString('hex', 0, 4))

        callback(null, acceptFile)
    },
    limits: {
        fileSize: 1024 * 1024 * 12, // 12 mb
    }
};




@Service()
@JsonController('/image')
export class ImageController {

    constructor(
        @Inject("logger") private logger: Logger,

        @InjectRepository(ImageUrl)
        private imageRepository: Repository<ImageUrl>,

        @InjectRepository(Horse)
        private horseRepository: Repository<Horse>
    ) { }

    @Authorized()
    @Post("/upload")
    async upload(@BodyParam("horseId") horseId: HorseId, @UploadedFile('image', { options: fileUploadOptions, required: false }) file: Express.Multer.File, @Session() session: ISession) {


        this.logger.info("upload image")
        let horse = await this.horseRepository.findOne({ id: horseId.id }, { relations: [] })

        if (file && horse && session.userId) {

            if (horse.owner?.id != session.userId) {
                this.logger.info(`Invalid user. Users id ${session.userId} did not match owners id ${horse?.owner?.id}`)
                await deleteFile(file.path)

                return {
                    success: false
                }
            }

            if (horse.imageUrls.length >= maxImagesPerHorse) {
                this.logger.info(`Horse exceeded allowed limit of ${maxImagesPerHorse} images, (${horse.imageUrls.length})`)
                await deleteFile(file.path)

                return {
                    success: false
                }
            }

            let urlPrefix = `${serverUrl}${uploadPrefix}/${horse.feifId}`;
            if (process.env.NODE_ENV == "production") {
                urlPrefix = `${uploadPrefix}/${horse.feifId}`;
            }


            const imageUrl = new ImageUrl()
            imageUrl.horse = horse
            imageUrl.showIndex = horseId.showIndex
            imageUrl.originalFileName = file.originalname
            imageUrl.ownerId = session.userId


            try {
                // create thumb
                const thumbFilename = ("thumb_" + path.basename(file.path)).toLowerCase()

                const qualityFactor = 1.5;

                let thumbImageResult = await new Promise((resolve, reject) => {
                    sharp(file.path)
                        .resize({ width: 300 * qualityFactor, height: 240 * qualityFactor })
                        .toFile(path.join(path.dirname(file.path), thumbFilename), (err, info) => {
                            if (err) reject(err)
                            else resolve(info)
                        });
                })
                imageUrl.thumbUrl = `${urlPrefix}/${thumbFilename}`
                console.log('thumbImageResult:', thumbImageResult)
            } catch (error) {
                this.logger.error("error during thumb processing" + error)
            }

            // resize too large image
            if (file.size > 1024 * 1024 * 2) {
                try {
                    // resize image
                    const imageFilename = ("image_" + path.basename(file.path)).toLowerCase()
                    let imageResult = await new Promise((resolve, reject) => {
                        sharp(file.path)
                            .resize({ width: 800 })
                            .toFile(path.join(path.dirname(file.path), imageFilename), (err, info) => {
                                if (err) reject(err)
                                else resolve(info)
                            });
                    })

                    console.log("imageResult:", imageResult)

                    imageUrl.internalPath = path.join(path.dirname(file.path), imageFilename)
                    imageUrl.url = `${urlPrefix}/${imageFilename}`
                    // delete the uploaded file
                    await deleteFile(file.path)

                } catch (error) {
                    this.logger.error("error during image processing" + error)
                }
            } else {
                imageUrl.internalPath = file.path
                imageUrl.url = `${urlPrefix}/${path.basename(file.path)}`
            }





            await this.horseRepository.save(horse)
            var result = await this.imageRepository.save(imageUrl);


            return {
                success: true,
                result
            }
        }
        return {
            success: false
        }
    }


    @Authorized()
    @Post("/delete")
    async delete(@BodyParam("imageId") imageId: ImageId, @Session() session: ISession) {
        const { id } = imageId;

        this.logger.info("delete image", id)


        if (id && session.userId) {
            // var horses = await this.horseRepository
            //     .createQueryBuilder("horse")
            //     .leftJoinAndSelect("horse.owner", "owner", "owner.id = :id", { id: user.id })
            //     .leftJoinAndSelect("horse.imageUrls", "imageUrls")
            //     .getMany()


            // var imageIds = horses.flatMap(x => x.imageUrls).map(x => x.id)

            // console.log()
            // if (imageIds.includes(id)) {
            var image = await this.imageRepository.findOne({ id })

            if (image && image.ownerId == session.userId) {
                try {
                    await deleteFile(image.internalPath);
                } catch (error) {
                    this.logger.error(error)
                }

                await this.imageRepository.remove(image)
                return true

            }
            // }

            return false;
        }
        return false;
    }


    @Authorized()
    @Post("/updateIndex")
    async updateIndex(@Body() indices: ImageId[], @Session() session: ISession) {

        if (session.userId) {
            let results: UpdateResult[] = [];
            await this.imageRepository.manager.transaction(async manager => {
                for (let index = 0; index < indices.length; index++) {
                    var result = await manager.createQueryBuilder()
                        .update(ImageUrl)
                        .set({
                            showIndex: indices[index].showIndex
                        })
                        .where("id = :id", { id: indices[index].id })
                        .andWhere("ownerId = :ownerId", { ownerId: session.userId })
                        .execute();


                    results.push(result);
                }
            })

            var allUpdated = results.reduce((accumulated, result) => accumulated += result.affected || 0, 0) == indices.length
            return allUpdated
        }
        return false


    }
}