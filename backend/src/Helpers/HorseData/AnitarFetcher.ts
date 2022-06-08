import { IHorseDataFetcher } from "./IHorseDataFetcher";
import { WorldFengurInfo } from "../../Models/WorldFengurInfo";

import nodeFetch from "node-fetch";
import Container, { Service } from "typedi";
import { WorldFengurHorse } from "./../../Models/WorldFengurHorse";
import { ConnectionManager } from "typeorm";


@Service()
export class AnitarFetcher implements IHorseDataFetcher {


    async getHorseByFeifId(feifId: string): Promise<WorldFengurInfo> {
        let worldFengurInfo = new WorldFengurInfo();
        worldFengurInfo.feifId = feifId;

        try {
            const horseInfo = await this.getHorse(feifId);

            const nameArray = this.tryOrDefault(() => horseInfo.horse[0].split(' '), ['', '', ''])

            worldFengurInfo.firstName = nameArray[0]
            worldFengurInfo.prefix = nameArray[1]
            worldFengurInfo.origin = nameArray.slice(2).join(' ')
            worldFengurInfo.sexInWorldfengur = this.tryOrDefault(() => horseInfo.genderDe[0] === "Stute" ? 2 : 1, 0)
            worldFengurInfo.yearOfBirth = this.tryOrDefault(() => horseInfo.dateOfBirth[0].split('-')[0], null)
            worldFengurInfo.fatherid = this.tryOrDefault(() => horseInfo.fatherFeifId[0], '')
            worldFengurInfo.fathername = this.tryOrDefault(() => horseInfo.father[0], '')
            worldFengurInfo.motherid = this.tryOrDefault(() => horseInfo.motherFeifId[0], '')
            worldFengurInfo.mothername = this.tryOrDefault(() => horseInfo.mother[0], '')


            const horseInfoFather = await this.getHorse(horseInfo.fatherFeifId[0]);

            worldFengurInfo.fathersfatherid = this.tryOrDefault(() => horseInfoFather.fatherFeifId[0], '')
            worldFengurInfo.fathersfathername = this.tryOrDefault(() => horseInfoFather.father[0], '')
            worldFengurInfo.fathersmotherid = this.tryOrDefault(() => horseInfoFather.motherFeifId[0], '')
            worldFengurInfo.fathersmothername = this.tryOrDefault(() => horseInfoFather.mother[0], '')



            const horseInfoMother = await this.getHorse(horseInfo.motherFeifId[0]);

            worldFengurInfo.mothersfatherid = this.tryOrDefault(() => horseInfoMother.fatherFeifId[0], '')
            worldFengurInfo.mothersfathername = this.tryOrDefault(() => horseInfoMother.father[0], '')
            worldFengurInfo.mothersmotherid = this.tryOrDefault(() => horseInfoMother.motherFeifId[0], '')
            worldFengurInfo.mothersmothername = this.tryOrDefault(() => horseInfoMother.mother[0], '')

            console.log({
                worldFengurInfo
            })

        } catch (error) {
            console.error(error)
        }
        return worldFengurInfo;
    }


    private tryOrDefault<T>(callback: () => T, defaultValue: T): T {
        try {
            return callback()
        } catch (error) {
            return defaultValue
        }
    }


    private async getHorse(feifId: string): Promise<any> {
        console.log('get horse data of', feifId)
        try {
            const repository = Container.get(ConnectionManager).get().getRepository(WorldFengurHorse)


            var databaseData = await repository.findOne({
                where: {
                    feifId
                }
            });

            if (databaseData && databaseData.data) {
                const jsondata = JSON.parse(databaseData.data);

                console.log('lucky us, we found the horse in the database', feifId)
                return jsondata
            }

            var anitarInfo = await (await nodeFetch(`https://anitar.herokuapp.com/api/horse/?feifId=${feifId}`)).json();
            const horseInfo = anitarInfo['env:Body'][0]['horseAssessmentOffspringResponseElement'][0]['result'][0]

            delete horseInfo.owner
            delete horseInfo.breeder
            delete horseInfo.assessment
            delete horseInfo.offspring
            delete horseInfo.photo
            delete horseInfo.freezemark
            delete horseInfo.dateOfDeath



            var data = new WorldFengurHorse();
            data.feifId = feifId;
            data.data = JSON.stringify(horseInfo)
            if (!databaseData) {
                await repository.save(data)
            }
            else if (!databaseData.data) {
                await repository.update({
                    feifId
                }, {
                    data: data.data
                })
            }

            return horseInfo;
        } catch (error) {
            console.error(error)
            var data = new WorldFengurHorse();
            data.feifId = feifId;
            return data
        }

    }
}