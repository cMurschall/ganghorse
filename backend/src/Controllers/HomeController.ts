
import { Service, Inject } from "typedi";
import { Get, Controller, Header } from "routing-controllers";

import { InjectRepository } from "typeorm-typedi-extensions";
import { Logger } from "pino";
import { Repository } from "typeorm";
import { SitemapStream, streamToPromise } from 'sitemap'

import { Readable } from 'stream'

import { Horse, Status } from "./../Models/HorseEntity";
import { BlogController } from "./BlogController";
// @ts-ignore
import RSS from "rss-generator";

interface BlogPost {
    title: string,
    date: Date,
    author: string,
    body: string
}

@Service()
@Controller('/')
export class HomeController {

    constructor(

        @Inject("logger") private logger: Logger,
        @InjectRepository(Horse)
        private horseRepository: Repository<Horse>,


    ) { }


    @Get('sitemap.xml')
    @Header('Content-Type', 'application/xml')
    async createSitemap() {
        console.log("generate sitemap")
        const horses = await this.horseRepository.find({
            where: {
                status: Status.Published
            }
        })

        const blogController = new BlogController();
        const posts = await blogController.getBlogPosts()
        // An array with your links
        const links = [
            { url: '/', changefreq: 'daily' },
            { url: '/blog/', changefreq: 'weekly' },
            ...posts.map(post => {
                return {
                    url: `/blog/${post.id}`,
                    changefreq: 'weekly'
                }
            }),
            ...horses.map(horse => {
                return {
                    url: `/horse/${horse.id}/`,
                    changefreq: 'weekly'
                }
            })]

        // Create a stream to write to
        const stream = Readable.from(links).pipe(new SitemapStream({ hostname: 'https://gang.horse' }))
        const data = await streamToPromise(stream)

        return data.toString()
    }


    @Get('robots.txt')
    @Header('Content-Type', 'text/plain;charset=UTF-8')
    createRobots() {
        console.log("generate createRobots")
        const robots = `
User-agent: *
Allow: /
Disallow: /horseEditor
Disallow: /ownHorses
Disallow: /usersHorses
Disallow: /favorites
Disallow: /settings
Disallow: /aboutUs
Disallow: /privacy
Disallow: /forgottenPassword

Sitemap: https://gang.horse/sitemap.xml
`

        return robots
    }


    //feed.rss

    @Get('feed.rss')
    @Header('Content-Type', 'application/xml')
    async createRssFeed() {
        console.log("generate rss feed xml")

        const blogController = new BlogController();
        const posts = await blogController.getBlogPosts()

        //console.log({RSS({})})

        const feed = new RSS({
            title: 'Gang.horse blog',
            description: 'Einblicke in das Innenleben meines Hobby-Projekts.',
            feed_url: 'https://gang.horse/feed.rss',
            site_url: 'https://gang.horse/blog',
            image_url: 'https://gang.horse/logoSquare.png',
            managingEditor: 'Christian Murschall',
            language: 'de',
            generator : 'rss-gen',
            // categories: ['Category 1','Category 2','Category 3'],
            // pubDate: 'May 20, 2012 04:00:00 GMT',
            ttl: '60',
        })

        posts.forEach(post => {
            //console.log(post)
            feed.item({
                title: post.title,
                description: post.excerpt,
                url: `https://gang.horse/blog/${post.id}`, // link to the item
                guid: post.id, // optional - defaults to url
                //categories: ['Category 1','Category 2','Category 3','Category 4'], // optional - array of item categories
                author: post.author, // optional - defaults to feed author property
                date: post.date, // any format that js Date can parse.         
                enclosure  : { url : `https://gang.horse/api/${post.imageUrl}`}
            });
        });        

        return feed.xml({ indent: false });
    }


}