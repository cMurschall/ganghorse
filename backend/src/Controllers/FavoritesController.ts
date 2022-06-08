
import { JsonController, Post, Body, Authorized, Session, Get } from "routing-controllers";
import { Service, Inject } from "typedi";
import { Logger } from "pino";
import { InjectRepository } from "typeorm-typedi-extensions";

import { Repository } from "typeorm";

import { ISession } from './../Helpers/Authentication';
import { Favorite } from './../Models/FavoriteEntity';
// import { Horse } from './../Models/HorseEntity';


interface GetAllResult {
    success: boolean
    horseIds: string[]
}

interface HorseData {
    horseId: string
}


@Service()
@JsonController('/favorite')
export class FavoritesController {

    constructor(
        @Inject("logger") private logger: Logger,

        @InjectRepository(Favorite)
        private repository: Repository<Favorite>,

        // @InjectRepository(Horse)
        // private horseRepository: Repository<Horse>,

    ) { }

    @Get("/all")
    async all(@Session({ required: false }) session: ISession) {

        this.logger.info("favorite all")
        if (session && session.userId) {

            var result: GetAllResult = {
                success: false,
                horseIds: []
            }

            const favorites = await this.repository.find({
                where: {
                    userId: session.userId
                }
            })
            result.horseIds = favorites.map(x => x.horseId)
            result.success = true;

            return result
        }
        else {
            return []
        }
    }


    @Authorized()
    @Post("/add")
    async add(@Body() data: HorseData, @Session() session: ISession) {

        this.logger.info("favorite add")
        if (data.horseId && session.userId) {


            var favorite = new Favorite();
            favorite.horseId = data.horseId;
            favorite.userId = session.userId

            let created = false;

            await this.repository.manager.transaction(async transactionalEntityManager => {
                var count = await transactionalEntityManager.count(Favorite, {
                    horseId: data.horseId,
                    userId: session.userId
                })
                if (count == 0) {
                    await transactionalEntityManager.save(Favorite, favorite)
                    created = true;
                }
            });

            return created;
        } else {
            return false
        }
    }

    @Authorized()
    @Post("/remove")
    async remove(@Body() data: HorseData, @Session() session: ISession) {

        this.logger.info("favorite remove")
        if (data.horseId && session.userId) {

            var result = await this.repository.delete({
                horseId: data.horseId,
                userId: session.userId
            })
            console.log(result)
            return true;
        } else {
            return false
        }
    }

}