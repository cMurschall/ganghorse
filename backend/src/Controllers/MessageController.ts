import { JsonController, Post, Body, CurrentUser, BodyParam, ResponseClassTransformOptions } from "routing-controllers";
import { Service, Inject } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Message } from "./../Models/MessageEntity";
import { User } from "./../Models/UserEntity";
import { Horse } from "./../Models/HorseEntity";
import { IMailer } from "./../Helpers/Mailer/IMailer";
import { newMessageAddedMessages } from "./../Helpers/Messages"
import { appUrl } from "./../Helpers/Misc";



interface TopicInput {
    topicId: string
}

interface MessageInput {
    topicId: string,
    text: string,
    locale?: string
}

@JsonController('/message')
@Service()
export class MessageController {

    constructor(
        @InjectRepository(Message)
        private repository: Repository<Message>,

        @Inject("mailer") private mailer: IMailer
    ) { }


    @ResponseClassTransformOptions({
        groups: ['everyone']
    })
    @Post("/findByTopic")
    findByTopic(@BodyParam("input") input: TopicInput) {

        console.log('findByTopic', input)

        let { topicId } = input;
        return this.repository.find({
            where: {
                topicId
            }
        });
    }


    @Post("/add")
    async add(@Body() data: MessageInput, @CurrentUser() user: User) {
        const { text, topicId } = data

        console.log('add message: ', data)

        const horse = await this.repository
            .manager
            .createQueryBuilder(Horse, "horse")
            .leftJoinAndSelect("horse.owner", "user")
            .where("horse.id = :horseId", { horseId: topicId })
            .getOne();

        if (horse && horse.owner) {
            const chatParticipants = (await this.repository.find({
                where: { topicId: topicId }
            }))
                .filter(x => x.author.canNotify)
                .map(x => x.author.email)

            var uniqueMails = Array.from(new Set(chatParticipants.concat([horse.owner.email])))

            for (const email of uniqueMails) {

                const locale = data.locale || 'en'
                const url = `${appUrl}/horseDetail/${topicId}`

                await this.mailer.sendMail({ email, name: "Gang Horse" }, {
                    subject: newMessageAddedMessages[locale].subject,
                    text: newMessageAddedMessages[locale].text(url, [horse.name]),
                    html: newMessageAddedMessages[locale].html(url, [horse.name]),
                })
            }

        }



        const message = new Message();
        message.author = user;
        message.text = text;
        message.topicId = topicId

        return await this.repository.save(message);
    }
}