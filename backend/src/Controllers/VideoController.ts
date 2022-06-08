import path from 'path'

import { JsonController, Post, Body, Req, HttpCode, Session, Authorized, BodyParam } from "routing-controllers";

import { Service, Inject } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import nodeFetch from "node-fetch";

import { Horse } from "./../Models/HorseEntity";

import { Aws } from "./../Helpers/Aws";
import { VideoUrl, VideoStatus } from './../Models/VideoEntity';
import { ISession } from './../Helpers/Authentication';

import { Logger } from "pino";
import { maxVideosPerHorse } from './../Helpers/Misc';
import { redis } from './../Helpers/Redis';


interface CreateUrlData {
    horseId: string,
    fileName: string,
    fileType: string
}

interface UrlCreatedData {
    url: string,
    video: VideoUrl
}

interface UploadNotifyData {
    videoId: string,
    fileName: string,
}

interface YoutubeUrl {
    horseId: string,
    youtubeUrl: string
}



interface VideoId {
    id: string,
    showIndex: number
}




@JsonController('/video')
@Service()
export class VideoController {

    readonly redisPrefix: string = "VIDEO_";
    prefixKey = (key: string) => this.redisPrefix + key;

    constructor(

        @Inject("logger") private logger: Logger,

        @InjectRepository(VideoUrl)
        private repository: Repository<VideoUrl>,


        @InjectRepository(Horse)
        private horseRepository: Repository<Horse>,

        @Inject("aws") private aws: Aws
    ) { }



    @Post("/findById")
    async findById(@BodyParam("videoId") videoId: VideoId): Promise<VideoUrl | undefined> {
        const { id } = videoId;

        this.logger.info("queryStatus of video id", id)
        return await this.repository.findOne({ id }, { relations: [] })
    }



    @Post("/saveYoutube")
    async saveYoutube(@BodyParam("youtubeData") youtubeData: YoutubeUrl, @Session() session: ISession): Promise<VideoUrl | undefined> {

        console.log('saveYoutube', { youtubeData, userId: session.userId })

        const { horseId, youtubeUrl } = youtubeData;
        const { userId } = session


        const horse = await this.horseRepository.findOne({ id: horseId }, { relations: [] })
        if (horse && userId) {

            if (horse.owner?.id != userId) {
                this.logger.info(`Invalid user. Users id ${session.userId} did not match owners id ${horse?.owner?.id}`)

                return undefined;
            }

            const regex = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)(?<videoId>[\w\-]+)(\S+)?$/gm;

            const youtubeVideoKey = regex.exec(youtubeUrl)?.groups?.videoId || ''

            const noCookieLink = `https://www.youtube-nocookie.com/embed/${youtubeVideoKey}`;

            console.log('noCookieLink')

            const video = new VideoUrl();
            video.status = VideoStatus.Converted
            video.youtubeLink = noCookieLink

            video.originalFileName = youtubeVideoKey
            video.horse = horse;
            video.ownerId = horse.owner.id


            await this.horseRepository.save(horse)
            await this.repository.save(video)


            return video
        }

        return undefined
    }


    @Post("/createUrl")
    async createUrl(@Body() input: CreateUrlData, @Session() session: ISession): Promise<UrlCreatedData | undefined> {

        console.log('createUrl', { input, userId: session.userId })

        try {
            const { horseId, fileName, fileType } = input
            const { userId } = session



            const horse = await this.horseRepository.findOne({ id: horseId }, { relations: [] })

            if (horse && userId) {

                if (horse.owner?.id != userId) {
                    this.logger.info(`Invalid user. Users id ${session.userId} did not match owners id ${horse?.owner?.id}`)

                    return undefined;
                }

                const actualVideoCount = horse.videoUrls.filter(x => x.status === VideoStatus.Converted || !x.youtubeLink.length).length;
                if (actualVideoCount >= maxVideosPerHorse) {
                    this.logger.info(`Horse exceeded allowed limit of ${maxVideosPerHorse} videos, (${horse.videoUrls.length})`)

                    return undefined;
                }

                const video = new VideoUrl();
                video.originalFileName = fileName;
                video.horse = horse;
                video.ownerId = horse.owner.id

                const generatedUrl = this.aws.createSingleFileUrl(horse.feifId, fileType, path.extname(fileName))

                video.status = VideoStatus.UrlCreated
                video.awsFileName = generatedUrl.fileName;

                await this.horseRepository.save(horse)
                await this.repository.save(video)

                console.log('saved video to redis id ', {
                    key: this.prefixKey(generatedUrl.path),
                    value: video.id
                })
                await redis.set(this.prefixKey(generatedUrl.path), video.id, 'ex', 60 * 60 * 24 * 2) // 2 day expiration time


                const returnValue = {
                    url: generatedUrl.uploadUrl,
                    video: video
                };


                return returnValue;
            } else {
                return undefined
            }
        } catch (error) {
            console.error(error)
            return undefined
        }

    }


    @HttpCode(200)
    @Post("/uploadNotify")
    uploadNotify(@Body() input: UploadNotifyData) {

        return this.repository
            .createQueryBuilder()
            .update(VideoUrl)
            .set({ status: VideoStatus.Uploaded, })
            .where("id = :id", { id: input.videoId })
            .execute();
    }




    @HttpCode(200)
    @Post("/awsJobNotify")
    async awsJobNotify(@Req() request: any): Promise<string> {


        const body = JSON.parse(request.body);
        // needs subscription : https://docs.aws.amazon.com/de_de/sns/latest/dg/sns-http-https-endpoint-as-subscriber.html

        if (body.Type === 'SubscriptionConfirmation') {
            console.log('confirmation message revieved.')
            const confirmationResponse = await nodeFetch(body.SubscribeURL);
            if (confirmationResponse.status == 200) {
                console.log('Yes! We have accepted the confirmation from AWS');
            }
            console.log(confirmationResponse)
        }
        else if (body.Type == 'Notification') {
            const message = JSON.parse(body.Message)
            const isComplete = message.detail.status === 'COMPLETE'
            const isError = message.detail.status === 'ERROR'

            console.log('AWS Notification', message)

            // console.log(message.detail)
            const inputFile = message.detail.userMetadata.input


            const redisKey = this.prefixKey(/ganghorseinput\/(?<id>.+)$/gm.exec(inputFile)?.groups?.id || 'noVideoId')
            var videoId = await redis.get(redisKey)
            const video = await this.repository.findOne({ id: videoId || '' }, { relations: ['horse'] })

            if (isComplete) {

                const outputGroupDetails = message.detail.outputGroupDetails

                if (video) {
                    video.status = VideoStatus.Converted
                    outputGroupDetails.forEach((group: any) => {
                        // console.log('group: ', group);

                        if (group.type === 'DASH_ISO_GROUP') {
                            video.videoUrlDash = group['playlistFilePaths'][0]

                        } else if (group.type === 'FILE_GROUP') {
                            const mp4 = group['outputDetails'].find((x: any) => x['outputFilePaths'][0].endsWith('mp4'))
                            const jpg = group['outputDetails'].find((x: any) => x['outputFilePaths'][0].endsWith('jpg'))

                            if (mp4) {
                                video.videoUrlMp4 = mp4['outputFilePaths'][0]
                                video.durationInMs = mp4['durationInMs']
                            }
                            if (jpg) {
                                video.posterUrl = jpg['outputFilePaths'][0]
                            }
                        }
                    })

                    await this.repository.save(video)
                } else {
                    console.log(`could not find redis key/ video db entry ${redis} in original sting: ${inputFile}`)
                }

            }
            else if (isError) {
                console.log('aws error : ', message.detail.errorMessage)
                if (video) {
                    video.awsErrorMessage = message.detail.errorMessage
                    video.status = VideoStatus.Error

                    await this.repository.save(video)

                }



                // if we have an input coded error
                if (video && message.detail.errorCode == 1020 && inputFile.endsWith('.mp4')) {

                    console.log('looks like input codec error, we accept anyway');
                    let inputSource = inputFile.replace('s3://', '')
                    const bucketPath = await this.aws.copyVideo(video.horse.id, inputSource)
                    if (bucketPath) {

                        video.videoUrlMp4 = bucketPath;
                        video.status = VideoStatus.Converted
                        await this.repository.save(video)
                    }
                }
            }

            // finally delete uploaded input file
            if (video && video.horse.feifId) {
                await this.aws.deleteInputVideo(inputFile);
            } else {
                console.error("could not delete file from aws:", {
                    video,
                    feifId: video?.horse.feifId
                })
            }
        }

        return ''
    }





    @Authorized()
    @Post("/delete")
    async delete(@BodyParam("videoId") videoId: VideoId, @Session() session: ISession) {
        const { id } = videoId;
        this.logger.info("delete video", id)

        if (id && session.userId) {

            var video = await this.repository.findOne({ id }, { relations: ['horse'] })

            if (video && video.ownerId == session.userId) {
                try {
                    await this.aws.deleteVideo(video.horse.feifId, video.awsFileName)
                } catch (error) {
                    this.logger.error(error)
                }

                await this.repository.remove(video)
                return true
            }

            return false;
        }
        return false;
    }
}