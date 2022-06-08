import fs from "fs";
import path from 'path';
import { CronJob } from 'cron'
import { Connection } from "typeorm";
import { Horse } from "../../Models/HorseEntity";




export class Vacuumer {

    job: CronJob;
    constructor(private dir: string, private connection: Connection) {

        let everyMidNight = '0 0 * * * *';
        // let everySecond = '* * * * * *';
        this.job = new CronJob(everyMidNight,
            async () => {
                console.log('Start cleaning ');
                await this.clean()
            },
            null,
            true,
        );
    }



    /**
     * clean
     */
    private async clean() {

        try {
            var directories = await this.listDirs(this.dir);
            var horses = await this.connection
                .createQueryBuilder(Horse, 'horse')
                .select(['horse.feifId'])
                .getMany();

            var unusedDirectories = directories.filter(x => !horses.map(h => h.feifId).includes(x.name)).map(x => path.resolve(this.dir, x.name))

            for (let index = 0; index < unusedDirectories.length; index++) {
                await this.removeDir(unusedDirectories[index])
            }

        } catch (error) {
            console.error(error)
        }
    }


    private listDirs(dir: string): Promise<fs.Dirent[]> {
        return new Promise((resolve, reject) => {
            fs.readdir(dir, {
                withFileTypes: true
            }, (error, files) => {
                if (error) reject(error)
                else resolve(files.filter(x => x.isDirectory() && Horse.isFeifId(x.name)) || <fs.Dirent[]>[]);

            })
        })
    }
    private removeDir(dir: string) {
        return new Promise((resolve, reject) => {
            fs.rmdir(dir, {
                recursive: true
            }, err => {
                if (err) reject(err)
                else resolve()
            })
        })
    }

}