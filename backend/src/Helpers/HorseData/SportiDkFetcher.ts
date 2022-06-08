import { IHorseDataFetcher } from "./IHorseDataFetcher";
import { WorldFengurInfo } from "../../Models/WorldFengurInfo";
import nodeFetch from "node-fetch";




export class SportiDkFetcher implements IHorseDataFetcher {
    async getHorseByFeifId(feifId: string): Promise<WorldFengurInfo> {



        var info = await (await nodeFetch(`https://www.sporti.dk/en/ajax/feif.php?feifid=${feifId}`)).json();

        const worldFengurInfo = new WorldFengurInfo();
        worldFengurInfo.updateFromJson(info);

        return worldFengurInfo;

    }
}