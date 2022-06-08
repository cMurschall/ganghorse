import { Entity, Column, OneToMany, ManyToMany, JoinTable } from "typeorm";
import { EntityBase } from "./EntityBase";
import { User } from "./UserEntity";
import { PrivateMessage } from "./PrivateMessageEntity";




@Entity("conversations")
export class Conversation extends EntityBase {

    // @ManyToMany(() => User, user => user.conversations)
    // @JoinTable()
    @Column({ type: "text", array: true , nullable: true})
    memberIds: string[] = [];

    @Column({ type: "varchar", length: 50, nullable: true, default: "" })
    horseId: string;

    @Column({ type: "varchar", length: 50, nullable: true, default: "" })
    horseName: string;

    @OneToMany(() => PrivateMessage, message => message.conversation)
    messages: PrivateMessage[];
}



