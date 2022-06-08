import { JsonController, BodyParam, Post } from "routing-controllers";
import { WorldFengurInfo } from "./../Models/WorldFengurInfo";
import { Service, Inject } from "typedi";
import { Logger } from "pino";
import { Horse } from "./../Models/HorseEntity";
import { IHorseDataFetcher } from "./../Helpers/HorseData/IHorseDataFetcher";

@Service()
@JsonController('/worldfengur')
export class WorldFengurController {

    constructor(
        @Inject("logger") private logger: Logger,
        @Inject("horseDataFetcher") private horseDataFetcher: IHorseDataFetcher
    ) { }


    @Post("/findById")
    async findById(@BodyParam("feifId") feifId: string): Promise<WorldFengurInfo> {

        this.logger.info("Requested worldfengur of " + feifId);
        const value = new WorldFengurInfo()

        if (Horse.isFeifId(feifId)) {
            value.feifId = feifId
            try {
                var worldFengurInfo = await this.horseDataFetcher.getHorseByFeifId(feifId);

                return worldFengurInfo;
            } catch (error) {
                this.logger.error(error);
                return value;
            }
        }
        this.logger.info("Feif id " + feifId + " did not match regex");
        return value;
    }
}