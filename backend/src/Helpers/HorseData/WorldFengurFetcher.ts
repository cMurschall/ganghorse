
import nodeFetch from "node-fetch";
import { CookieJar } from "tough-cookie"
import fetchCookie from "fetch-cookie"
import cherioo from "cheerio";


import { IHorseDataFetcher } from "./IHorseDataFetcher";
import { WorldFengurInfo } from "../../Models/WorldFengurInfo";
import { CronJob } from 'cron';


export class WorldFengurFetcher implements IHorseDataFetcher {

    isLogin: boolean;
    cookieJar: CookieJar;
    job: CronJob;
    fetch: Function;


    constructor() {


        this.cookieJar = new CookieJar();

        this.fetch = fetchCookie(nodeFetch, this.cookieJar)


        // let every20Minutes = '* */20 * * * *';
        // // let everySecond = '* * * * * *';
        // this.job = new CronJob(every20Minutes,
        //     async () => {
        //         await this.login()
        //     },
        //     null,
        //     true,
        // );
    }



    async getHorseByFeifId(feifId: string): Promise<WorldFengurInfo> {

        console.log(feifId)
        if (!this.isLogin) {
            await this.login();
        }

        return new WorldFengurInfo()
    }


    async login() {
        console.log("attempt to login")
        try {

            const params = new URLSearchParams();
            params.append('userid', 'yyyyyyyyyyyyyyyy');
            params.append('password', 'xxxxxxxxxxxxxx');

            var loginResponse = await this.fetch("https://www.worldfengur.com/login_stadfest.jsp?refresh=0.2495529873579414", {
                method: "POST",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:81.0) Gecko/20100101 Firefox/81.0",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                    "Accept-Language": "de,en-GB;q=0.7,en;q=0.3",
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Upgrade-Insecure-Requests": "1",
                    "Sec-Fetch-Dest": "document",
                    "Sec-Fetch-Mode": "navigate",
                    "Sec-Fetch-Site": "same-origin",
                    "Sec-Fetch-User": "?1"
                },
                body: params,
                rejectUnauthorized: false,
            })
            console.log(loginResponse)
            console.log(this.cookieJar)
        } catch (error) {
            console.error(error)
        }

    }
}


