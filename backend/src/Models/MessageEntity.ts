import { Entity, Column, ManyToOne } from "typeorm";
import { EntityBase } from "./EntityBase";

import { User } from "./UserEntity";
import { Expose } from "class-transformer";


@Entity("messages")
export class Message extends EntityBase {

    @Expose()
    @Column("character varying", { length: 100, nullable: false, default: '' })
    topicId: string;

    @Expose()
    @Column("character varying", { length: 1000, nullable: false, default: '' })
    text: string;


    @Expose()
    @ManyToOne(() => User, { eager: true })
    author: User;    

}