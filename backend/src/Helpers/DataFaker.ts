
import path from "path"
import fs from "fs"

import Faker from "faker";
import { loremIpsum } from "lorem-ipsum";
import { Connection } from "typeorm";

import { User } from "./../Models/UserEntity";
import { Location } from "./../Models/LocationEntity";
import { Horse, Color, Gender, Status, Currency } from "../Models/HorseEntity";
import { ImageUrl } from "./../Models/ImageUrlEntity";
import { Message } from "./../Models/MessageEntity";
// import sharp from "sharp";

export class DataFaker {
    private faker: Faker.FakerStatic;
    private loremDescriptions: Array<string> = []

    private loremImageUrls: Array<string> = ['https://loremflickr.com/800/600']


    private randomLocations: Array<Location> = []

    constructor(private connection: Connection) {


        this.faker = Faker;

        // prefill descriptions with dummy text.
        for (let index = 0; index < 10; index++) {
            this.loremDescriptions.push('_' + this.genereateText());
        }
    }


    public async fillDatabase(noUsers: number = 20, maxHorsesPerUser: number = 10): Promise<void> {



        this.randomLocations = await this.connection
            .getRepository(Location)
            .createQueryBuilder("location")
            .orderBy("RANDOM()")
            .limit(5000)
            .getMany();

        console.log("created " + this.randomLocations.length + " random locations")

        let users: User[] = Array(noUsers).fill(0).map(() => this.createUser());

        console.log("created " + users.length + " random userss")

        let horses: Horse[] = [];
        let messages: Message[] = [];

        for (let userIndex = 0; userIndex < users.length; userIndex++) {
            const horsesPerUser = this.faker.random.number({ min: 0, max: maxHorsesPerUser });
            if (horsesPerUser > 1) {
                for (let index = 0; index < horsesPerUser; index++) {
                    horses.push(await this.createHorse(users[userIndex]))
                }
            }
        }

        console.log("created " + horses.length + " random horses")

        // fs.writeFileSync('../users.json', JSON.stringify(users));
        // fs.writeFileSync('../horses.json', JSON.stringify(horses));


        await this.connection.transaction(async transactionalEntityManager => {
            users = await transactionalEntityManager.getRepository(User).save(users);
            horses = await transactionalEntityManager.getRepository(Horse).save(horses);


            const urls = horses.flatMap(x => Array.isArray(x.imageUrls) ? x.imageUrls : [])
            await transactionalEntityManager.getRepository(ImageUrl).save(urls)
        });

        // create fake messages
        for (let horseIndex = 0; horseIndex < horses.length; horseIndex++) {
            const horse = horses[horseIndex];
            const messagesPerHorse = this.faker.random.number({ min: 0, max: 10 });
            for (let index = 0; index < messagesPerHorse; index++) {
                var user = this.faker.random.arrayElement(users)
                if (index % 2 == 0 && horse.owner) {
                    user = horse.owner
                }

                var message = new Message();
                message.author = user;
                message.topicId = horse.id;
                message.text = '_' + loremIpsum({
                    count: this.faker.random.number({ min: 1, max: 5 }),
                    format: "plain",
                    sentenceLowerBound: 2,
                    sentenceUpperBound: 6,
                    suffix: "\n",
                    units: "sentences",
                })
                messages.push(message)
            }
        }

        await this.connection.getRepository(Message).save(messages);

    }



    public createUser(): User {
        const user = new User();

        user.name = `_${this.faker.name.firstName()} ${this.faker.name.lastName()}`
        user.email = this.faker.internet.email();
        user.avatarUrl = this.faker.image.avatar();

        user.publicDescription = loremIpsum({
            count: this.faker.random.number({ min: 3, max: 5 }),
            format: "plain",
            sentenceLowerBound: 2,
            sentenceUpperBound: 6,
            suffix: "\n",
            units: "sentences",
        });

        user.authenticationProvider = this.faker.random.arrayElement(["github", "facebook"]);
        user.authenticationProviderId = this.faker.random.uuid();
        return user;
    }

    public async createHorse(owner: User): Promise<Horse> {

        const horse = new Horse();
        horse.owner = owner;

        horse.color = this.faker.random.number({ min: Color.Brauner, max: (Object.keys(Color).length / 2) - 1 });
        // horse.color = Color.Brauner;
        horse.gender = this.faker.random.number({ min: Gender.Mare, max: Gender.Stallion });
        horse.status = this.faker.random.number({ min: Status.Published, max: Status.Draft });


        horse.yearOfBirth = this.faker.random.number({ min: 2000, max: 2018 });
        horse.height = this.faker.random.number({ min: 1.30, max: 1.47, precision: 0.01 });

        horse.firstName = '_' + this.faker.name.firstName();
        horse.prefix = this.faker.random.arrayElement(['von', 'fra'])
        horse.origin = this.faker.name.lastName();

        horse.fatherid = this.generateFifeId()
        horse.fathername = this.faker.name.findName()
        horse.fathersfatherid = this.generateFifeId()
        horse.fathersfathername = this.faker.name.findName()
        horse.fathersmotherid = this.generateFifeId()
        horse.fathersmothername = this.faker.name.findName()
        horse.motherid = this.generateFifeId()
        horse.mothername = this.faker.name.findName()
        horse.mothersfatherid = this.generateFifeId()
        horse.mothersfathername = this.faker.name.findName()
        horse.mothersmotherid = this.generateFifeId()
        horse.mothersmothername = this.faker.name.findName()

        horse.tagline = this.faker.lorem.sentence(4, 7);

        const price = this.faker.random.number({ min: 2000, max: 45000 })
        horse.priceMin = price,
            horse.priceMax = price
        if (this.faker.random.boolean()) {
            horse.priceMax += this.faker.random.number({ min: 1000, max: 2000 })
        }

        horse.currency = this.faker.random.arrayElement([Currency.EUR, Currency.CHF]);

        horse.feifId = this.generateFifeId()

        // var randomLocation = this.faker.random.number({ min: 1, max: 10000 });

        // const location = await this.connection
        //     .getRepository(Location)
        //     .createQueryBuilder("location")
        //     .orderBy("RANDOM()")
        //     .getOne();

        const location = this.faker.random.arrayElement(this.randomLocations);
        horse.location = location || new Location();;

        horse.imageUrls = Array(this.faker.random.number({ min: 1, max: 5 }))
            .fill(0)
            .map(_ => this.faker.random.arrayElement(this.loremImageUrls))
            .map((url, index) => {
                const newurl = new ImageUrl()
                newurl.url = url;
                newurl.showIndex = index + 1
                newurl.horse = horse;
                newurl.internalPath = ""
                newurl.originalFileName = this.faker.system.fileName('.png')
                return newurl;
            })

        horse.imageUrls = []

        horse.description = this.faker.random.arrayElement(this.loremDescriptions);


        return horse;
    }


    private generateFifeId(): string {
        return `DE${this.faker.random.number({ min: 2000, max: 2020 })}${this.faker.random.number({ min: 0, max: 2 })}${this.faker.random.number({ min: 100, max: 999 })}${this.faker.random.number({ min: 10, max: 99 })}`;
    }

    private genereateText(): string {
        return loremIpsum({
            count: 5,                // Number of "words", "sentences", or "paragraphs"
            format: "html",         // "plain" or "html"
            paragraphLowerBound: 3,  // Min. number of sentences per paragraph.
            paragraphUpperBound: 7,  // Max. number of sentences per paragarph.
            // random: Math.random,     // A PRNG function
            sentenceLowerBound: 5,   // Min. number of words per sentence.
            sentenceUpperBound: 15,  // Max. number of words per sentence.
            suffix: "\n",            // Line ending, defaults to "\n" or "\r\n" (win32)
            units: "paragraph",      // paragraph(s), "sentence(s)", or "word(s)"
        })
    }
}