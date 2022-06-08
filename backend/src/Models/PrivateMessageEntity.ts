import { Entity, Column, ManyToOne } from "typeorm";
import { EntityBase } from "./EntityBase";
import { Conversation } from "./ConversationEntity";



@Entity("privateMessages")
export class PrivateMessage extends EntityBase {


    @Column({ type: "varchar", length: 50, nullable: true, default: "" })
    senderUserId: string;


    @Column({ type: "varchar", length: 50, nullable: true, default: "" })
    receiverUserId: string;


    @Column("character varying", { length: 10000, nullable: false, default: '' })
    text: string;


    @Column({ nullable: false, default: false })
    readByReceiver: boolean;


    @ManyToOne(() => Conversation, conversation => conversation.messages)
    conversation: Conversation;

}
