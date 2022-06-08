import {
    OnConnect,
    SocketController,
    ConnectedSocket,
    OnDisconnect,
    OnMessage,
    MessageBody,
    SocketIO
} from 'socket-controllers';
import sanitizeHtml from "sanitize-html"
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Repository } from 'typeorm';
import { Inject, Service } from 'typedi';
import { Socket, Server } from 'socket.io'
import { JsonController, Get, Session, CurrentUser, Post, Body } from 'routing-controllers';

import { Conversation } from './../Models/ConversationEntity';
import { User } from './../Models/UserEntity';
import { Horse } from './../Models/HorseEntity';
import { PrivateMessage } from './../Models/PrivateMessageEntity';

import { IMailer } from "./../Helpers/Mailer/IMailer";
import { newPrivateMessageNotification } from "./../Helpers/Messages"
import { Message } from '@src/Models/MessageEntity';


interface ConversationData {
    horse?: {
        horseId: string,
        horseName: string,
    }
    conversationId?: string
    conversationPartnerId: string

    text: string
}

interface UserSocket {
    userId: string
    socketId: string
}


@SocketController()
@JsonController('/conversation')
@Service()
export class ConversationSocket {

    connectedSockets: UserSocket[] = [];

    constructor(
        @InjectRepository(Conversation)
        private conversationRepository: Repository<Conversation>,

        @InjectRepository(PrivateMessage)
        private messageRepository: Repository<PrivateMessage>,

        @InjectRepository(User)
        private userRepository: Repository<User>,

        @Inject("mailer") private mailer: IMailer
    ) { }

    @OnConnect()
    async connection(@ConnectedSocket() socket: Socket) {
        // console.log('client connected', { id: socket.id, name: socket.request.session.user.name });

        if (socket.request.session.user.id) {
            const userId = socket.request.session.user.id

            this.connectedSockets.push({
                socketId: socket.id,
                userId: userId
            })

            let conversations = await this.conversationRepository
                .createQueryBuilder("conversation")
                .where('conversation.memberIds @> ARRAY[:userId]', { userId })
                .getMany()

            socket.join(conversations.map(x => x.id))
        }
    }

    @OnDisconnect()
    async disconnect(@ConnectedSocket() socket: Socket) {
        // console.log('client disconnected');
        this.connectedSockets = this.connectedSockets.filter(x => x.socketId !== socket.id)
    }


    @OnMessage('MESSAGE_SEND')
    async messageSend(@ConnectedSocket() socket: Socket, @SocketIO() io: Server, @MessageBody() message: ConversationData) {

        console.log("Message send ", message)
        const { horse, conversationId, conversationPartnerId, text } = message

        const sanitizedText = sanitizeHtml(text);

        const users = await this.userRepository.findByIds([socket.request.session.userId, conversationPartnerId])
        if (users.length !== 2) {
            console.error("we should have gotten two users!", {
                userId: socket.request.session.userId,
                conversationPartnerId
            })
            return;
        }
        const user = users.find(x => x.id == socket.request.session.userId)
        const partnerUser = users.find(x => x.id == conversationPartnerId)

        // lets keep track of the horse name so we can use it later in notification mail 
        let horseNameInMail = ''

        // if we have already an conversation
        if (conversationId) {
            // check if a conversation exist!
            let conversation = await this.conversationRepository.findOne(conversationId)
            if (conversation && partnerUser && user) {
                const privateMessage = new PrivateMessage();
                privateMessage.conversation = conversation
                privateMessage.receiverUserId = conversationPartnerId
                privateMessage.senderUserId = user.id
                privateMessage.readByReceiver = false
                privateMessage.text = sanitizedText

                console.log('added privateMessage to existing conversation', privateMessage)

                await this.messageRepository.save(privateMessage)

                horseNameInMail = conversation.horseName

                socket.nsp.to(conversationId).emit("MESSAGE_RECEIVED", privateMessage)
            }
        }
        // lets start a new conversation and add the incomming message
        else if (horse) {
            const { horseId, horseName } = horse

            if (horseId && horseName && partnerUser && user) {

                // check if a conversation exist!
                let conversation: Conversation | undefined = await this.conversationRepository
                    .createQueryBuilder("conversation")
                    .where({ horseId })
                    .andWhere('conversation.memberIds @> ARRAY[:userId]', { userId: socket.request.session.userId })
                    .getOne()


                // if no conversation is found create one
                if (!conversation) {
                    conversation = new Conversation()
                    conversation.horseId = horseId;
                    conversation.horseName = horseName
                    conversation.memberIds = [user.id, partnerUser.id]
                }

                const privateMessage = new PrivateMessage();
                privateMessage.conversation = conversation
                privateMessage.receiverUserId = conversationPartnerId
                privateMessage.readByReceiver = false
                privateMessage.senderUserId = user.id
                privateMessage.text = sanitizedText

                await this.conversationRepository.save(conversation)
                await this.messageRepository.save(privateMessage)

                socket.join(conversation.id)
                // need to add partner into room too
                for (const item of this.connectedSockets.filter(x => x.userId === conversationPartnerId)) {
                    const partnerSocket = io.sockets.connected[item.socketId]
                    if (partnerSocket) {
                        console.log('added partner to conversation ')
                        partnerSocket.join(conversation.id)
                    }
                }

                horseNameInMail = horseName;

                socket.nsp.to(conversation.id).emit("MESSAGE_RECEIVED", privateMessage)
            }
        }


        // finally send email to user?
        if (process.env.NODE_ENV === "production") {
            if (partnerUser && partnerUser.canNotify) {
                var locale = socket.request.headers['accept-language'].includes('de') ? 'de' : 'en'

                await this.mailer.sendMail({ email: partnerUser.email, name: "Gang Horse" }, {
                    subject: newPrivateMessageNotification[locale].subject,
                    text: newPrivateMessageNotification[locale].text(sanitizedText, [horseNameInMail]),
                    html: newPrivateMessageNotification[locale].html(sanitizedText, [horseNameInMail]),
                })
            }
        }
    }


    @OnMessage('MESSAGE_READ')
    async messageRead(@ConnectedSocket() socket: Socket, @MessageBody() messageId: string) {

        const userId = socket.request.session.userId
        if (userId) {
            const result = await this.messageRepository
                .createQueryBuilder()
                .update(PrivateMessage)
                .set({ readByReceiver: true })
                .where("id = :messageId", { messageId })
                .andWhere("receiverUserId = :userId", { userId })
                .returning(['conversation'])
                .execute()

            if (result.raw[0]) {
                const conversationId = result.raw[0].conversationId
                socket.nsp.to(conversationId).emit("MESSAGE_READ", messageId)
            }
        }
    }

    @Get("/")
    async getConversations(@CurrentUser() user: User) {
        console.log(`User '${user.name}' wants to get his conversations`)


        const conversations = await this.conversationRepository
            .createQueryBuilder("conversation")
            .where('conversation.memberIds @> ARRAY[:userId]', { userId: user.id })
            .leftJoinAndSelect("conversation.messages", "messages")
            .getMany()

        return conversations
    }
}