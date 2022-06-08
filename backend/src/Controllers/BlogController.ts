import fs from "fs"
import path from "path"

import { Service } from "typedi";
import { JsonController, Get, Param } from "routing-controllers";
import { Converter } from "showdown";
import glob from "glob"
import { blogPostPath } from "./../Helpers/Misc";




interface BlogPost {
    title: string,
    date: Date,
    author: string,
    id: string,
    imageUrl: string,
    excerpt: string,
    body: string
}

@Service()
@JsonController('/blog')
export class BlogController {

    @Get("/posts")
    async posts(): Promise<BlogPost[]> {
        return await this.getBlogPosts();
    }


    @Get("/post/:id")
    async post(@Param("id") id: string): Promise<BlogPost | undefined> {
        return (await this.getBlogPosts()).find(x => x.id === id);
    }



    async getBlogPosts() {

        let posts: BlogPost[] = []

        console.log('posts', blogPostPath)
        if (fs.existsSync(blogPostPath)) {

            const files = await new Promise<string[]>((resolve, reject) => {
                glob('*.md', { cwd: blogPostPath }, (error, matches) => {
                    if (error) reject(error)
                    else {
                        resolve(matches)
                    }
                })
            })

            const converter = new Converter({
                metadata: true
            })

            for await (const file of files) {

                const content = await new Promise<string>((resolve, reject) => {
                    fs.readFile(path.join(blogPostPath, file), 'utf8', (error, content) => {
                        if (error) reject(error)
                        else resolve(content)
                    })
                })

                const html = converter.makeHtml(content)
                const metadata = <any>converter.getMetadata(); // returns an object with the document metadata

                const parts = metadata.date.split('-').map(Number)

                posts.push({
                    author: metadata.author.trim(),
                    title: metadata.title.trim(),
                    id: metadata.id.trim(),
                    date: new Date(`${parts[0]},${parts[1] + 0},${parts[2]}`),
                    excerpt: metadata.excerpt ? metadata.excerpt.trim() : '',
                    imageUrl: metadata.imageUrl ? metadata.imageUrl.trim() : '',
                    body: html
                })
            }

            posts.sort((a, b) => {
                return a.date.getTime() - b.date.getTime();
            })
        }
        return posts
    }
}