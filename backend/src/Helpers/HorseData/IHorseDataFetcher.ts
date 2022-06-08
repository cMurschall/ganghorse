import { WorldFengurInfo } from "./../../Models/WorldFengurInfo";

export interface IHorseDataFetcher {
    getHorseByFeifId(feifId: string): Promise<WorldFengurInfo>
}
