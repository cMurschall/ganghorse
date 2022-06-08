

import { JsonController, Body, Post, Delete, BodyParam, CurrentUser, ResponseClassTransformOptions, Authorized, Session, Req } from "routing-controllers";
import { Request } from "express";
import { Service, Inject } from "typedi";
import { Repository, Brackets } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { IsInt, Min, IsEnum, IsUUID } from 'class-validator';
import sanitizeHtml from "sanitize-html"

import { Horse, Status, Color, Gender, Currency } from "./../Models/HorseEntity";
import { ImageUrl } from './../Models/ImageUrlEntity';
import { User } from './../Models/UserEntity';
import { Message } from './../Models/MessageEntity';
import { Favorite } from "./../Models/FavoriteEntity";

import { ISession } from "./../Helpers/Authentication";
import { CurrencyConverter } from "./../Helpers/CurencyConverter";
import { IMailer } from "./../Helpers/Mailer/IMailer";

import { noUserDescription } from "./../Helpers/Messages"


class Pagination {
    @IsInt()
    @Min(0)
    skip: number;

    @IsInt()
    @Min(0)
    take: number;
}

interface Range {
    min: number,
    max: number
}

interface PriceRange {
    range: Range
    currency: Currency
}

interface LocationCoordinates {
    type: 'coordinate';
    longitude: number
    latitude: number
}

interface LocationId {
    type: 'id';
    id: number
}

class LocationRadius {
    data: LocationCoordinates | LocationId
    searchRadiusInKm: number;
}

export class SeachOptions {
    includeMares: boolean = true;
    includeGeldings: boolean = true;
    includeStallions: boolean = true;

    // priceRange?: Range

    priceRangeCurrency?: PriceRange


    heightRange?: Range;

    ageRange?: Range;

    location?: LocationRadius;

    // @ArrayContains(Object.values(Color))
    colors?: Color[];

    userId?: string;
}


interface HorseRange {

    priceRange: Range;

    heightRange: Range;

    ageRange: Range;

    countHorses: number;

    colors: string[];


}

class ChangeStatus {
    @IsUUID(4)
    horseId: string;

    @IsEnum(Status)
    newStatus: Status;
}

interface UpdatedHorseResult {
    success: boolean,
    updatedHorse: Horse | undefined
}



interface HorseWithFavoriteCount {
    horse: Horse,
    favoriteCount: number
}


@JsonController('/horse')
@Service()
export class HorseController {

    constructor(
        @InjectRepository(Horse)
        private repository: Repository<Horse>,

        @InjectRepository(ImageUrl)
        private imageRepository: Repository<ImageUrl>,

        @InjectRepository(Message)
        private messageRepository: Repository<Message>,

        @InjectRepository(Favorite)
        private favoriteRepository: Repository<Favorite>,

        @Inject("currencyConverter") private currencyConverter: CurrencyConverter,

        @Inject("mailer") private mailer: IMailer
    ) { }

    // @ResponseClassTransformOptions({
    //     groups: ['everyone']
    // })
    // @Get("/all")
    // async all(@BodyParam("page", { required: false }) pagination?: Pagination): Promise<Horse[]> {
    //     if (pagination) {
    //         return await this.repository.find({
    //             skip: pagination.skip,
    //             take: pagination.take,
    //             order: {
    //                 createdAt: "DESC"
    //             }
    //         });
    //     } else {
    //         return await this.repository.find({
    //             order: {
    //                 createdAt: "DESC"
    //             }
    //         });
    //     }
    // }

    @ResponseClassTransformOptions({
        groups: ['everyone']
    })
    @Post("/findByOptions")
    async find(
        @BodyParam("options") options: SeachOptions,
        @BodyParam("page", { required: false }) pagination?: Pagination,
        @BodyParam("userCurrency", { required: false }) userCurrency?: Currency,
    ) {

        const {
            includeGeldings,
            includeMares,
            includeStallions,
            // heightRange,
            // priceRange,
            priceRangeCurrency,
            ageRange,
            location,
            colors,
            userId } = options || {};


        // console.log({options, pagination, userCurrency})


        var queryBuilder = this.repository.createQueryBuilder("horse");

        queryBuilder.leftJoinAndSelect("horse.location", "location")
        queryBuilder.leftJoinAndSelect("horse.imageUrls", "imageurl")
        queryBuilder.leftJoinAndSelect("horse.videoUrls", "videourl")
        queryBuilder.leftJoinAndSelect("horse.owner", "user")


        queryBuilder.andWhere("horse.status = :status", { status: Status.Published })




        if (priceRangeCurrency) {

            let { min, max } = priceRangeCurrency.range
            let { currency } = priceRangeCurrency

            if (currency != undefined) {
                if (min) {
                    var minEUR = this.currencyConverter.convert({
                        amount: min,
                        currency: currency
                    }, Currency.EUR)

                    var minDKK = this.currencyConverter.convert({
                        amount: min,
                        currency: currency
                    }, Currency.DKK)

                    var minSEK = this.currencyConverter.convert({
                        amount: min,
                        currency: currency
                    }, Currency.SEK)

                    var minCHF = this.currencyConverter.convert({
                        amount: min,
                        currency: currency
                    }, Currency.CHF)

                    queryBuilder.andWhere(`
                    CASE
                        WHEN horse.currency = 0 THEN horse.priceMax >= :priceMinEUR
                        WHEN horse.currency = 1 THEN horse.priceMax >= :priceMinDKK
                        WHEN horse.currency = 2 THEN horse.priceMax >= :priceMinSEK
                        WHEN horse.currency = 3 THEN horse.priceMax >= :priceMinCHF
                    END
                    `, {
                        priceMinEUR: Math.floor(minEUR?.amount || Number.MAX_SAFE_INTEGER),
                        priceMinDKK: Math.floor(minDKK?.amount || Number.MAX_SAFE_INTEGER),
                        priceMinSEK: Math.floor(minSEK?.amount || Number.MAX_SAFE_INTEGER),
                        priceMinCHF: Math.floor(minCHF?.amount || Number.MAX_SAFE_INTEGER),
                    })

                }
                if (max) {
                    var maxEUR = this.currencyConverter.convert({
                        amount: max,
                        currency: currency
                    }, Currency.EUR)

                    var maxDKK = this.currencyConverter.convert({
                        amount: max,
                        currency: currency
                    }, Currency.DKK)

                    var maxSEK = this.currencyConverter.convert({
                        amount: max,
                        currency: currency
                    }, Currency.SEK)

                    var maxCHF = this.currencyConverter.convert({
                        amount: max,
                        currency: currency
                    }, Currency.CHF)

                    queryBuilder.andWhere(`
                    CASE
                        WHEN horse.currency = 0 THEN horse.priceMin <= :priceMaxEUR
                        WHEN horse.currency = 1 THEN horse.priceMin <= :priceMaxDKK
                        WHEN horse.currency = 2 THEN horse.priceMin <= :priceMaxSEK
                        WHEN horse.currency = 3 THEN horse.priceMin <= :priceMaxCHF
                    END
                    `, {
                        priceMaxEUR: Math.floor(maxEUR?.amount || Number.MAX_SAFE_INTEGER),
                        priceMaxDKK: Math.floor(maxDKK?.amount || Number.MAX_SAFE_INTEGER),
                        priceMaxSEK: Math.floor(maxSEK?.amount || Number.MAX_SAFE_INTEGER),
                        priceMaxCHF: Math.floor(maxCHF?.amount || Number.MAX_SAFE_INTEGER),
                    })
                }
            }

        }

        if (ageRange) {

            let { min, max } = ageRange
            if (min) {
                queryBuilder.andWhere("horse.yearOfBirth >= :yearOfBirthMin", { yearOfBirthMin: min })
            }
            if (max) {
                queryBuilder.andWhere("horse.yearOfBirth <= :yearOfBirthMax", { yearOfBirthMax: max })
            }
        }

        if (colors && colors.length > 0) {

            queryBuilder.andWhere("horse.color IN (:...colors)", { colors })
        }


        if (userId) {

            queryBuilder.andWhere("horse.userId = :userId", { userId })
        }

        if (includeGeldings || includeMares || includeStallions) {

            // console.log({
            //     includeGeldings, includeMares, includeStallions
            // })


            queryBuilder.andWhere(new Brackets(qb => {

                if (includeGeldings) {
                    qb.orWhere("horse.gender = :gelding", { gelding: Gender.Gelding })
                }
                if (includeMares) {
                    qb.orWhere("horse.gender = :mare", { mare: Gender.Mare })
                }
                if (includeStallions) {
                    qb.orWhere("horse.gender = :stallion", { stallion: Gender.Stallion })
                }
            }))
        } else {
            return []
        }



        if (location) {

            if ((location.data as LocationId).id) {
                let { id } = location.data as LocationId;

                queryBuilder.andWhere("ST_DWithin(Geography(location.coordinate), Geography((select coordinate from postalcodes where id = :id)), :radius )", {
                    id,
                    radius: location.searchRadiusInKm * 1000
                })
            }
            else {
                let { longitude, latitude } = location.data as LocationCoordinates;

                queryBuilder.andWhere("ST_DWithin(Geography(location.coordinate),Geography(ST_MakePoint(:longitude, :latitude)), :radius )", {
                    longitude,
                    latitude,
                    radius: location.searchRadiusInKm * 1000
                })
            }
        }

        if (pagination) {
            let { take, skip } = pagination;

            queryBuilder.skip(skip);
            queryBuilder.take(take);
        }

        queryBuilder.orderBy("horse.createdAt", "DESC")

        // return queryBuilder.getMany()
        var result = await queryBuilder.getManyAndCount();

        console.log({ userCurrency })
        if (userCurrency != undefined) {
            result[0].forEach(horse => {
                var otherAmountMin = this.currencyConverter.convert({
                    amount: horse.priceMin || 0,
                    currency: horse!.currency || Currency.EUR
                }, userCurrency)

                var otherAmountMax = this.currencyConverter.convert({
                    amount: horse.priceMax || 0,
                    currency: horse!.currency || Currency.EUR
                }, userCurrency)

                if (otherAmountMin && otherAmountMax) {
                    horse.otherPrices.push({
                        priceMin: otherAmountMin,
                        priceMax: otherAmountMax
                    })
                }
            })
        }


        const [horses, resultCount] = result

        const horseIds = horses.map(x => x.id)

        if (resultCount > 0 && horseIds.length) {
            var messages = await this.messageRepository
                .createQueryBuilder("message")
                .select("message.topicId", "topicId")
                .addSelect("count(*) as count")
                .where("message.topicId IN (:...horseIds)", { horseIds })
                .groupBy("message.topicId")
                .getRawMany();

            messages.forEach(x => {
                const candidate = horses.find(h => h.id == x.topicId)
                if (candidate) {
                    candidate.messageCount = x.count
                }
            })
        }
        return result;

    }

    @ResponseClassTransformOptions({
        groups: ['everyone']
    })
    @Post("/findById")
    async findById(@BodyParam("id") id: string, @Session() session: ISession): Promise<Horse | undefined> {
        console.log('findById', id)
        const horse = await this.repository.findOne({ id });
        if (horse?.status !== Status.Published && horse?.owner?.id !== session.userId) {
            return undefined
        }
        if (horse?.status == Status.Deleted) {
            return undefined;
        }
        return horse
    }




    // @ResponseClassTransformOptions({
    //     groups: ['everyone']
    // })
    // @Post("/findByIds")
    // findByIds(@BodyParam("ids") ids: string[]): Promise<Horse[] | undefined> {
    //     return this.repository.findByIds(ids);
    // }


    @ResponseClassTransformOptions({
        groups: ['everyone', 'user']
    })
    @Post("/findOwn")
    async findOwn(@Session() session: ISession): Promise<HorseWithFavoriteCount[]> {
        console.log('findOwn', session.userId)

        var queryBuilder = this.repository.createQueryBuilder("horse");

        queryBuilder.leftJoinAndSelect("horse.location", "location")
        queryBuilder.leftJoinAndSelect("horse.imageUrls", "imageurl")
        queryBuilder.leftJoinAndSelect("horse.videoUrls", "videourl")
        queryBuilder.leftJoinAndSelect("horse.owner", "user")

        queryBuilder.where("horse.owner.id = :ownerid", { ownerid: session.userId })
        queryBuilder.andWhere("horse.status != :status", { status: Status.Deleted })

        var horses = await queryBuilder.getMany();

        var favorites = await this.favoriteRepository
            .createQueryBuilder("favorite")
            .where("favorite.horseId IN (:...ids)", { ids: horses.map(x => x.id) })
            .select("favorite.horseId as horseid")
            .addSelect("COUNT (*) as counter")
            .groupBy("favorite.horseId")
            .getRawMany();


        // console.log('favorites', favorites.map(x => x))


        return horses.map(h => {
            return <HorseWithFavoriteCount>{
                horse: h,
                favoriteCount: favorites.find(y => y.horseid == h.id)?.counter || 0
            }
        });

    }



    @ResponseClassTransformOptions({
        groups: ['everyone']
    })
    @Post("/findUsersIds")
    async findUsersIds(@BodyParam("userId") userId: string) {
        console.log('findUsersIds')
        var queryBuilder = this.repository.createQueryBuilder("horse");
        queryBuilder.leftJoinAndSelect("horse.owner", "user")
        queryBuilder.select("horse.id", "horseId")

        queryBuilder.where("horse.owner.id = :ownerid", { ownerid: userId })
        queryBuilder.andWhere("horse.status = :status", { status: Status.Published })

        return await queryBuilder.getRawMany();
    }



    @Post("/range")
    async getRange(@BodyParam("userCurrency") userCurrency: Currency = Currency.EUR) {



        const dbResult = await this.repository
            .createQueryBuilder("horse")

            .where("horse.status = :status", { status: Status.Published })

            .select(`MIN(horse.height)`, "heightMin")
            .addSelect(`MAX(horse.height)`, "heightMax")

            .addSelect(`MIN(horse.yearOfBirth)`, "yearOfBirthMin")
            .addSelect(`MAX(horse.yearOfBirth)`, "yearOfBirthMax")

            .addSelect(`COUNT(*)`, "horses")

            // .addSelect(`MIN(horse.price)`, "priceMin")
            // .addSelect(`MAX(horse.price)`, "priceMax")

            .getRawOne();


        const priceGrouped = await this.repository
            .createQueryBuilder("horse")
            .where("horse.status = :status", { status: Status.Published })
            // .andWhere("horse.price > 1")
            .select('horse.currency', "currency")
            .addSelect(`MIN(horse.priceMin)`, "priceMin")
            .addSelect(`MAX(horse.priceMax)`, "priceMax")
            .groupBy("horse.currency")
            .getRawMany();


        // console.log('priceGrouped', priceGrouped)

        const priceMin = Math.floor(Math.min(...priceGrouped.map(x => this.currencyConverter.convert({
            amount: x.priceMin,
            currency: x.currency
        }, userCurrency)).map(x => x?.amount || Number.MAX_VALUE)))

        const priceMax = Math.ceil(Math.max(...priceGrouped.map(x => this.currencyConverter.convert({
            amount: x.priceMax,
            currency: x.currency
        }, userCurrency)).map(x => x?.amount || Number.MIN_VALUE)))

        console.log('prices', { priceMin, priceMax })




        // need to hit the database a second time since we need many results.
        const colors = await this.repository
            .createQueryBuilder("horse")
            .where("horse.status = :status", { status: Status.Published })
            .select("DISTINCT horse.color")
            .orderBy("horse.color", "ASC")
            .getRawMany();


        const range: HorseRange = {
            priceRange: {
                min: priceMin,
                max: priceMax
            },
            heightRange: {
                min: dbResult.heightMin,
                max: dbResult.heightMax
            },
            ageRange: {
                min: dbResult.yearOfBirthMin,
                max: dbResult.yearOfBirthMax
            },
            colors: colors.map(x => x.color),
            countHorses: dbResult.horses
        };
        console.log('range', range)
        // if (currency) {
        //     console.log('currency', currency)
        //     // todo
        // }


        return range;
    }


    @ResponseClassTransformOptions({
        groups: ['everyone']
    })
    @Post("/create")
    async create(@BodyParam('horse') horse: Horse, @CurrentUser() user: User) {
        // this is only for creation, not updating
        if (horse.id) {
            return horse;
        }



        horse.status = Status.Draft
        horse.owner = user

        // remove old item if exists
        await this.repository
            .createQueryBuilder()
            .delete()
            .from(Horse)
            .where("feifId = :feifId", { feifId: horse.feifId })
            .andWhere("status IN (:...status)", { status: [Status.Draft, Status.Deleted] })
            .execute();

        return await this.repository.save(horse);
    }





    @ResponseClassTransformOptions({
        groups: ['everyone']
    })
    @Post("/update")
    @Authorized()
    async update(@Body() horse: Horse, @CurrentUser() user: User, @Req() request: Request) {
        //var result = await this.repository.update(horse.id, horse);

        var dbHorse = await this.repository.findOne({ id: horse.id })

        var result: UpdatedHorseResult = {
            success: false,
            updatedHorse: dbHorse
        }

        console.log('found horse: ', dbHorse)

        if (dbHorse && dbHorse.owner && dbHorse.owner.id == user.id) {

            dbHorse.description = sanitizeHtml(horse.description || "")

            let updateResult = await this.repository.update({
                id: dbHorse.id
            }, {
                status: horse.status,
                gender: horse.gender,
                height: horse.height,
                color: horse.color,
                tagline: horse.tagline,
                description: sanitizeHtml(horse.description || ""),
                location: horse.location,
                // price: horse.price,
                priceMin: horse.priceMin,
                priceMax: horse.priceMax,

                currency: horse.currency,
                hasEczema: horse.hasEczema || false,

                // worldfengur fields
                feifId: horse.feifId,
                firstName: horse.firstName,
                prefix: horse.prefix,
                origin: horse.origin,
                yearOfBirth: horse.yearOfBirth,

                fatherid: horse.fatherid,
                fathername: horse.fathername,
                fathersfatherid: horse.fathersfatherid,
                fathersfathername: horse.fathersfathername,
                fathersmotherid: horse.fathersmotherid,
                fathersmothername: horse.fathersmothername,

                motherid: horse.motherid,
                mothername: horse.mothername,
                mothersfatherid: horse.mothersfatherid,
                mothersfathername: horse.mothersfathername,
                mothersmotherid: horse.mothersmotherid,
                mothersmothername: horse.mothersmothername
            })

            if (updateResult.affected && updateResult.affected > 0) {
                result.updatedHorse = await this.repository.findOne({ id: horse.id })
                result.success = true
                // preRenderQueue.add({ id: dbHorse.id })
            }


            if (horse.status == Status.Published && user.canNotify) {

                var description = user.publicDescription || ''

                if (description.length < 5) {
                    try {
                        var locale = request?.acceptsLanguages("de") || 'en'

                        await this.mailer.sendMail({ email: user.email, name: "Gang Horse" }, {
                            subject: noUserDescription[locale].subject,
                            text: noUserDescription[locale].text(user.email),
                            html: noUserDescription[locale].html(user.email),
                        })

                    } catch (error) {
                        console.error(error)
                    }
                }
            }
        }
        return result;
    }



    @Post("/changeStatus")
    @Authorized()
    async changeStatus(@BodyParam('data') data: ChangeStatus, @Session() session: ISession) {
        let { horseId, newStatus } = data;
        console.log('changeStatus', data)

        let dbHorse = await this.repository.findOne({ id: horseId })

        let result = {
            success: false,
            updatedHorse: dbHorse
        }

        if (dbHorse && dbHorse?.owner?.id == session.userId) {
            dbHorse.status = newStatus
            result.updatedHorse = await this.repository.save(dbHorse);
            result.success = true;

            return result
        }
        return result
    }

    @ResponseClassTransformOptions({
        groups: ['everyone']
    })
    @Delete("/remove")
    async remove(@BodyParam("id") id: string, @Session() session: ISession) {
        console.log('remove', { id, userid: session.userId })
        if (!id) {
            console.error("no id parameter was given")
            return false;
        }

        const horse = await this.repository.findOne(id)

        if (horse && horse.owner && horse.owner.id && horse.owner.id == session.userId) {

            try {
                if (horse.imageUrls && horse.imageUrls.length > 0) {
                    await this.imageRepository.delete(horse.imageUrls.map(x => x.id))
                }
            } catch (error) {
                console.error("could not delete images", error)
            }

            try {
                // delete video todo!
            } catch (error) {
                console.error("could not delete videos", error)
            }

            try {
                await this.messageRepository.delete({ topicId: horse.id })
            } catch (error) {
                console.error("could not delete messages", error)
            }

            try {
                await this.favoriteRepository.delete({ horseId: horse.id })
            } catch (error) {
                console.error("could not delete favorites", error)
            }

            let result = await this.repository.update({
                id
            }, {
                status: Status.Deleted
            });

            // var result = await this.repository.delete(id);
            return result?.affected && result.affected > 0 || false


        } else {
            console.log("horse was not deleted", {
                horse, isSameUser: horse?.owner?.id == session.userId
            })
            return false;
        }
    }
}